import { prisma } from "../../libs/prisma.lib.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../errors/app.error.js";

export class GetOrderById {
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
          ...(currentUser.type === "TENANT" && {
            where: {
              roomType: {
                property: { tenantId: currentUser.id },
              },
            },
          }),
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
