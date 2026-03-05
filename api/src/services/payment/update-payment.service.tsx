import { AppError } from "../../errors/app.error.js";
import { StatusOrder } from "../../generated/prisma/enums.js";
import {
  type IUpdatePaymentProof,
  type IUpdatePaymentStatus,
} from "../../types/payment.d.js";
import { prisma } from "../../libs/prisma.lib.js";
import { FileUpload } from "../../utils/file-upload.util.js";

const fileUpload = new FileUpload();

export class UpdatePayment {
  async updatePaymentProof(data: IUpdatePaymentProof) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: data.id,
        order: { userId: data.userId },
      },
    });

    if (!payment) {
      throw new AppError(404, "Payment not found or forbidden");
    }

    if (payment.status === "EXPIRED") {
      throw new AppError(400, "Payment already expired");
    }

    if (payment.status !== "PENDING") {
      throw new AppError(
        400,
        "Payment proof can only be uploaded for pending payments",
      );
    }

    const imageUrl = await fileUpload.uploadSingle(data.paymentProof.path);

    const updatedPayment = await prisma.payment.update({
      where: { id: data.id },
      data: {
        paymentProof: imageUrl,
        status: "WAITING_CONFIRMATION",
        paidAt: new Date(),
      },
    });

    return updatedPayment;
  }

  async updatePaymentStatus(data: IUpdatePaymentStatus) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: data.id,
        order: {
          orderItems: {
            some: {
              roomType: {
                property: {
                  tenantId: data.tenantId,
                },
              },
            },
          },
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new AppError(404, "Payment not found or forbidden");
    }

    if (payment.status !== "WAITING_CONFIRMATION") {
      throw new AppError(
        400,
        "Payment can only be updated after payment proof upload",
      );
    }

    const allowedStatus = ["DONE", "REJECTED", "CANCELLED"];

    if (!allowedStatus.includes(data.status)) {
      throw new AppError(400, "Invalid payment status update");
    }

    if (payment.order.status === "CANCELLED") {
      throw new AppError(400, "Order already cancelled");
    }

    const now = new Date();

    // MAP PAYMENT STATUS → ORDER STATUS
    let orderStatus: StatusOrder;

    switch (data.status) {
      case "DONE":
        orderStatus = "PAID";
        break;

      case "REJECTED":
        orderStatus = "WAITING_PAYMENT";
        break;

      case "CANCELLED":
        orderStatus = "CANCELLED";
        break;

      default:
        orderStatus = "WAITING_PAYMENT";
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: data.status,
        },
      });

      const updatedOrder = await tx.order.update({
        where: {
          id: payment.orderId,
        },
        data: {
          status: orderStatus,
          verifiedAt: data.status === "DONE" ? now : null,
        },
      });

      return { updatedPayment, updatedOrder };
    });

    return result;
  }
}
