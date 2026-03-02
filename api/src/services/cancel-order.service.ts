import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";

export class CancelOrderService {
  async cancelOrder(
    id: string,
    currentUser: { id: string; type: "USER" | "TENANT" },
  ) {
    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(currentUser.type === "USER" && { userId: currentUser.id }),
        ...(currentUser.type === "TENANT" && {
          orderItems: {
            some: {
              roomType: {
                property: {
                  tenantId: currentUser.id,
                },
              },
            },
          },
        }),
      },
      include: {
        payments: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found or forbidden");
    }

    if (order.status === "CANCELLED") {
      throw new AppError(400, "Order already cancelled");
    }

    if (order.status === "PAID") {
      throw new AppError(400, "Completed order cannot be cancelled");
    }

    if (order.status !== "WAITING_PAYMENT") {
      throw new AppError(400, "Only unpaid orders can be cancelled");
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ UPDATE ORDER
      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // 2️⃣ UPDATE PAYMENT
      if (order.payments.length > 0) {
        await tx.payment.updateMany({
          where: {
            orderId: id,
            status: {
              not: "CANCELLED",
            },
          },
          data: { status: "CANCELLED" },
        });
      }

      // 3️⃣ RESTORE ROOM STOCK
      for (const item of order.orderItems) {
        await tx.roomType.update({
          where: { id: item.roomTypeId },
          data: {
            totalRoom: {
              increment: item.roomQuantity,
            },
          },
        });
      }
    });

    return { message: "Order has been cancelled" };
  }
}
