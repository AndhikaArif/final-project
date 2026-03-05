import { prisma } from "../../libs/prisma.lib.js";
import { Prisma } from "../../generated/prisma/client.js";

export class GetAllPayments {
  // Payment History
  async getAllPayment(tenantId: string, page: number = 1, limit: number = 10) {
    page = Number(page) < 1 ? 1 : Number(page);
    limit = Number(limit) < 1 ? 10 : Number(limit);
    limit = limit > 20 ? 20 : limit;
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.PaymentWhereInput = {
      status: {
        in: ["DONE", "REJECTED", "CANCELLED", "EXPIRED"],
      },
      order: {
        orderItems: {
          some: {
            roomType: { property: { tenantId } },
          },
        },
      },
    };

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: whereCondition,
        include: {
          order: {
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
                    include: {
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
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  //   Update Payment For Approval
  async getAllPaymentForApproval(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    page = Number(page) < 1 ? 1 : Number(page);
    limit = Number(limit) < 1 ? 10 : Number(limit);
    limit = limit > 20 ? 20 : limit;
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.PaymentWhereInput = {
      status: "WAITING_CONFIRMATION",
      order: {
        orderItems: {
          some: {
            roomType: { property: { tenantId } },
          },
        },
      },
    };

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: whereCondition,
        include: {
          order: {
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
                    include: {
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
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}
