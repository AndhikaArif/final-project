import { prisma } from "../libs/prisma.lib.js";
import { Prisma, StatusOrder } from "../generated/prisma/client.js";
import { AppError } from "../errors/app.error.js";
import { type ICreateOrderItem } from "../types/order-item.js";

export class OrderService {
  async createOrder(userId: string, items: ICreateOrderItem[]) {
    // USER
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // ORDER ITEMS VALIDATION
    if (!items || items.length === 0) {
      throw new AppError(400, "Order items cannot be empty");
    }

    // ROOM TYPE DUPLICATE VALIDATION
    const uniqueRoomTypes = new Set(items.map((i) => i.roomTypeId));

    if (uniqueRoomTypes.size !== items.length) {
      throw new AppError(400, "Duplicate room type in order");
    }

    return prisma.$transaction(async (tx) => {
      const orderItemsData: any[] = [];
      let orderTotalAmount = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const now = new Date();

      for (const data of items) {
        // ROOM TYPE ID
        const roomType = await tx.roomType.findUnique({
          where: { id: data.roomTypeId },
        });

        if (!roomType) {
          throw new AppError(404, "Room type not found");
        }

        // DATE VALIDATION
        // invalid date
        const normalizedCheckIn = new Date(data.checkInDate);
        const normalizedCheckOut = new Date(data.checkOutDate);

        if (
          isNaN(normalizedCheckIn.getTime()) ||
          isNaN(normalizedCheckOut.getTime())
        ) {
          throw new AppError(400, "Invalid check-in or check-out date");
        }

        // normalized date
        normalizedCheckIn.setHours(0, 0, 0, 0);
        normalizedCheckOut.setHours(0, 0, 0, 0);

        // past date
        if (normalizedCheckIn < today) {
          throw new AppError(400, "Check-in date cannot be in the past");
        }

        if (normalizedCheckOut < today) {
          throw new AppError(400, "Check-out date cannot be in the past");
        }

        // check-out before check-in
        if (normalizedCheckOut <= normalizedCheckIn) {
          throw new AppError(400, "Check-out date must be after check-in date");
        }

        // STAY DURATION
        // duration count
        const oneDay = 1000 * 60 * 60 * 24;
        const duration =
          (normalizedCheckOut.getTime() - normalizedCheckIn.getTime()) / oneDay;

        // minimal duration
        if (duration < 1) {
          throw new AppError(400, "Stay duration must be at least 1 night");
        }

        // ROOM QUANTITY
        const roomQuantity = data.roomQuantity;

        if (!Number.isInteger(roomQuantity)) {
          throw new AppError(400, "Room quantity must be an integer");
        }

        if (roomQuantity < 1) {
          throw new AppError(400, "Room quantity must be at least 1");
        }

        if (roomQuantity > roomType.totalRoom) {
          throw new AppError(400, "Room quantity exceeds room capacity");
        }

        // CHECK AVAILABILITY
        const bookedRooms = await tx.orderItem.aggregate({
          where: {
            roomTypeId: data.roomTypeId,
            order: {
              OR: [
                {
                  status: "PAID",
                },
                {
                  status: "WAITING_PAYMENT",
                  expiredAt: { gt: now },
                },
              ],
            },
            AND: [
              { checkInDate: { lt: normalizedCheckOut } },
              { checkOutDate: { gt: normalizedCheckIn } },
            ],
          },
          _sum: {
            roomQuantity: true,
          },
        });

        const totalBooked = bookedRooms._sum.roomQuantity ?? 0;

        if (totalBooked + roomQuantity > roomType.totalRoom) {
          throw new AppError(409, "Not enough rooms available");
        }

        // TOTAL AMOUNT ORDER ITEM
        const totalAmountOrderItem =
          duration * roomType.basePrice * roomQuantity;

        // TOTAL AMOUNT ORDER
        orderTotalAmount += totalAmountOrderItem;

        // ORDER ITEM DATA
        orderItemsData.push({
          roomTypeId: data.roomTypeId,
          roomQuantity,
          checkInDate: normalizedCheckIn,
          checkOutDate: normalizedCheckOut,
          basePrice: roomType.basePrice,
          totalAmount: totalAmountOrderItem,
        });
      }

      // NESTED CREATE
      return tx.order.create({
        data: {
          userId,
          expiredAt: new Date(now.getTime() + 15 * 60 * 1000),
          totalAmount: orderTotalAmount,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: true,
        },
      });
    });
  }

  async getAllUserOrders(userId: string, page: number = 1, limit: number = 5) {
    page = Number(page) < 1 ? 1 : Number(page);
    limit = Number(limit) < 1 ? 5 : Number(limit);
    limit = limit > 15 ? 15 : limit;
    const skip = (page - 1) * limit;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              roomType: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: { userId },
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async getAllTenantOrders(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    status?: StatusOrder,
  ) {
    page = Number(page) < 1 ? 1 : Number(page);
    limit = Number(limit) < 1 ? 10 : Number(limit);
    limit = limit > 20 ? 20 : limit;
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.OrderWhereInput = {
      ...(status && Object.values(StatusOrder).includes(status)
        ? { status }
        : {}),
      orderItems: {
        some: {
          roomType: {
            property: {
              tenantId,
            },
          },
        },
      },
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              authAccount: {
                select: {
                  email: true,
                },
              },
            },
          },
          orderItems: {
            where: {
              roomType: {
                property: { tenantId },
              },
            },
            include: {
              roomType: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                  property: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(
    id: string,
    currentUser: { id: string; type: "USER" | "TENANT" },
  ) {
    const orConditions: Prisma.OrderWhereInput[] = [];

    if (currentUser.type === "USER") {
      orConditions.push({ userId: currentUser.id });
    }

    if (currentUser.type === "TENANT") {
      orConditions.push({
        orderItems: {
          some: { roomType: { property: { tenantId: currentUser.id } } },
        },
      });
    }

    if (orConditions.length === 0) {
      throw new AppError(403, "Unauthorized access");
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: orConditions,
      },
      include: {
        orderItems: {
          include: {
            roomType: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found or access denied");
    }

    return order;
  }
}
