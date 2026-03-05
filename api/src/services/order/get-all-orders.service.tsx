import { prisma } from "../../libs/prisma.lib.js";
import { Prisma, StatusOrder } from "../../generated/prisma/client.js";

export class GetAllOrders {
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
}
