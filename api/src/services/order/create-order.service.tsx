import { prisma } from "../../libs/prisma.lib.js";
import { AppError } from "../../errors/app.error.js";
import {
  type ICreateOrderItem,
  type IOrderContact,
} from "../../types/order-item.d.js";

export class CreateOrderService {
  async createOrder(
    userId: string,
    contact: IOrderContact,
    items: ICreateOrderItem[],
  ) {
    // USER VALIDATION
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // ORDER ITEM VALIDATION
    if (!items || items.length === 0) {
      throw new AppError(400, "Order items cannot be empty");
    }

    // CONTACT VALIDATION
    const { firstName, lastName, email, phoneNumber } = contact;

    if (!firstName || !lastName) {
      throw new AppError(400, "First name and last name are required");
    }

    if (!email) {
      throw new AppError(400, "Email is required");
    }

    if (!phoneNumber) {
      throw new AppError(400, "Phone number is required");
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

      for (const item of items) {
        // ROW LEVEL LOCKING
        await tx.$queryRaw`
        SELECT id FROM "RoomType"
        WHERE id = ${item.roomTypeId}
        FOR UPDATE
      `;

        const roomType = await tx.roomType.findUnique({
          where: { id: item.roomTypeId },
        });

        if (!roomType) {
          throw new AppError(404, "Room type not found");
        }

        // DATE VALIDATION
        const checkIn = new Date(item.checkInDate);
        const checkOut = new Date(item.checkOutDate);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          throw new AppError(400, "Invalid check-in or check-out date");
        }

        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        if (checkIn < today) {
          throw new AppError(400, "Check-in date cannot be in the past");
        }

        if (checkOut <= checkIn) {
          throw new AppError(400, "Check-out date must be after check-in date");
        }

        // STAY DURATION
        const duration =
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

        if (duration < 1) {
          throw new AppError(400, "Stay duration must be at least 1 night");
        }

        // ROOM QUANTITY VALIDATION
        const quantity = item.roomQuantity;

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new AppError(400, "Invalid room quantity");
        }

        if (quantity > roomType.totalRoom) {
          throw new AppError(400, "Room quantity exceeds room capacity");
        }

        // AVAILABILITY CHECK
        const booked = await tx.orderItem.aggregate({
          where: {
            roomTypeId: item.roomTypeId,
            order: {
              OR: [
                { status: "PAID" },
                {
                  status: "WAITING_PAYMENT",
                  expiredAt: { gt: now },
                },
              ],
            },
            AND: [
              { checkInDate: { lt: checkOut } },
              { checkOutDate: { gt: checkIn } },
            ],
          },
          _sum: {
            roomQuantity: true,
          },
        });

        const bookedRooms = booked._sum.roomQuantity ?? 0;

        if (bookedRooms + quantity > roomType.totalRoom) {
          throw new AppError(409, "Not enough rooms available");
        }

        // TOTAL PRICE
        const totalAmount = duration * roomType.basePrice * quantity;
        orderTotalAmount += totalAmount;

        orderItemsData.push({
          roomTypeId: item.roomTypeId,
          roomQuantity: quantity,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          basePrice: roomType.basePrice,
          totalAmount,
        });
      }

      // CREATE ORDER
      return tx.order.create({
        data: {
          userId,
          firstName,
          lastName,
          email,
          phoneNumber,
          expiredAt: new Date(now.getTime() + 60 * 60 * 1000),
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
}
