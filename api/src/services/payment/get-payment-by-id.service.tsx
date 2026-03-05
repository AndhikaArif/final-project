import { AppError } from "../../errors/app.error.js";
import { prisma } from "../../libs/prisma.lib.js";
import { Prisma } from "../../generated/prisma/client.js";

export class GetPaymentById {
  async getPaymentById(
    id: string,
    currentUser: { id: string; type: "USER" | "TENANT" },
  ) {
    const orConditions: Prisma.PaymentWhereInput[] = [];

    if (currentUser.type === "USER") {
      orConditions.push({ order: { userId: currentUser.id } });
    }

    if (currentUser.type === "TENANT") {
      orConditions.push({
        order: {
          orderItems: {
            some: { roomType: { property: { tenantId: currentUser.id } } },
          },
        },
      });
    }

    if (orConditions.length === 0) {
      throw new AppError(403, "Unauthorized access");
    }

    const payment = await prisma.payment.findFirst({
      where: { id, OR: orConditions },
      include: {
        order: {
          include: {
            orderItems: {
              ...(currentUser.type === "TENANT" && {
                where: {
                  roomType: {
                    property: { tenantId: currentUser.id },
                  },
                },
              }),
              include: { roomType: { include: { property: true } } },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(404, "Order not found or access denied");
    }

    return payment;
  }
}
