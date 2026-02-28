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

    await prisma.$transaction(async (tx) => {
      // UPDATE ORDER
      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      //   UPDATE PAYMENT
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

      //    RELEASE BOOKED ROOMS
      // await tx.bookedRooms.deleteMany({
      //   where: {
      //     orderItem: {
      //       orderId: id,
      //     },
      //   },
      // });
    });

    return { message: "Order has been cancelled" };
  }
}
