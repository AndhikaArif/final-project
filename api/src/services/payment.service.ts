import { AppError } from "../errors/app.error.js";
import { StatusPayment, StatusOrder } from "../generated/prisma/enums.js";
import {
  type ICreatePayment,
  type IUpdatePaymentProof,
  type IUpdatePaymentStatus,
} from "../types/payment.js";
import { prisma } from "../libs/prisma.lib.js";
import { Prisma } from "../generated/prisma/client.js";
import { FileUpload } from "../utils/file-upload.util.js";

const fileUpload = new FileUpload();

export class PaymentService {
  async createPayment(data: ICreatePayment) {
    // ORDER ID
    const order = await prisma.order.findUnique({
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
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (existingPayment) {
      throw new AppError(400, "Payment already created for this order");
    }

    // TOTAL PAID
    data.totalPaid = order.totalAmount; // fitur discount??

    const payment = await prisma.payment.create({ data });

    return payment;
  }

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

  async updatePaymentProof(data: IUpdatePaymentProof) {
    const payment = await prisma.payment.findFirst({
      where: { id: data.id, order: { userId: data.userId } },
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

    const updatedPayment = await prisma.payment.updateMany({
      where: { id: data.id, status: "PENDING" },
      data: {
        paymentProof: imageUrl,
        status: "WAITING_CONFIRMATION",
      },
    });

    if (updatedPayment.count === 0) {
      throw new AppError(400, "Payment status already changed");
    }

    const result = await prisma.payment.findUnique({
      where: { id: data.id },
    });

    return result;
  }

  async updatePaymentStatus(data: IUpdatePaymentStatus) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: data.id,
        order: {
          orderItems: {
            some: { roomType: { property: { tenantId: data.tenantId } } },
          },
        },
      },
      include: { order: true },
    });

    if (!payment) {
      throw new AppError(404, "Payment not found or forbidden");
    }

    if (payment.status !== "WAITING_CONFIRMATION") {
      throw new AppError(400, "Payment can only be verified after upload");
    }

    if (!["DONE", "REJECTED"].includes(data.status)) {
      throw new AppError(400, "Invalid status update");
    }

    const now = new Date();

    function mapPaymentStatusToOrderStatus(
      statusPayment: StatusPayment,
    ): StatusOrder {
      switch (statusPayment) {
        case "DONE":
          return "PAID";

        case "REJECTED":
          return "REJECTED";

        case "EXPIRED":
          return "EXPIRED";

        case "CANCELLED":
          return "CANCELLED";

        case "PENDING":
        case "WAITING_CONFIRMATION":
        default:
          return "WAITING_PAYMENT";
      }
    }

    const orderStatus = mapPaymentStatusToOrderStatus(data.status);

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id, status: "WAITING_CONFIRMATION" },
        data: {
          status: data.status,
          paidAt: data.status === "DONE" ? now : null,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: orderStatus,
          verifiedAt: data.status === "DONE" ? now : null,
        },
      });

      return { updatedPayment, updatedOrder };
    });
  }
}
