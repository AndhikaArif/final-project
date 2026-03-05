import { AppError } from "../../errors/app.error.js";
import { type ICreatePayment } from "../../types/payment.d.js";
import { prisma } from "../../libs/prisma.lib.js";

export class CreatePaymentService {
  async createPayment(data: ICreatePayment) {
    return prisma.$transaction(async (tx) => {
      // LOCK ORDER
      await tx.$queryRaw`
        SELECT id FROM "Order"
        WHERE id = ${data.orderId}
        FOR UPDATE
      `;

      // ORDER
      const order = await tx.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        throw new AppError(404, "Order not found");
      }

      // STATUS VALIDATION
      if (order.status !== "WAITING_PAYMENT") {
        throw new AppError(400, "Order is not waiting for payment");
      }

      // EXPIRED VALIDATION
      if (order.expiredAt && order.expiredAt < new Date()) {
        throw new AppError(400, "Order has expired");
      }

      // EXISTING PAYMENT
      const existingPayment = await tx.payment.findFirst({
        where: {
          orderId: order.id,
          status: {
            not: "CANCELLED",
          },
        },
      });

      if (existingPayment) {
        throw new AppError(400, "Payment already created for this order");
      }

      // CREATE PAYMENT
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          totalPaid: order.totalAmount,
        },
      });

      return payment;
    });
  }
}
