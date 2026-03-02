import cron from "node-cron";
import { prisma } from "../libs/prisma.lib.js";

export const paymentReminderScheduler = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running payment reminder job...");

    const now = new Date();

    try {
      await prisma.$transaction(async (tx) => {
        // REMINDER (10 MINUTES BEFORE)
        const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);

        const ordersToRemind = await tx.order.findMany({
          where: {
            status: "WAITING_PAYMENT",
            reminderSent: false,
            expiredAt: {
              lte: reminderTime,
              gt: now,
            },
          },
          include: {
            user: {
              include: {
                authAccount: true,
              },
            },
          },
        });

        for (const order of ordersToRemind) {
          console.log(
            `Send payment reminder to ${order.user.authAccount.email}`,
          );

          // TODO: kirim email / notification ?

          await tx.order.update({
            where: { id: order.id },
            data: { reminderSent: true },
          });
        }

        // AUTO EXPIRED
        const expiredOrders = await tx.order.findMany({
          where: {
            status: "WAITING_PAYMENT",
            expiredAt: {
              lte: now,
            },
          },
          include: {
            payments: true,
            orderItems: true,
          },
        });

        for (const order of expiredOrders) {
          console.log(`Expiring order ${order.id}`);

          // UPDATE ORDER STATUS
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });

          // UPDATE PAYMENT STATUS
          await tx.payment.updateMany({
            where: {
              orderId: order.id,
              status: "PENDING",
            },
            data: {
              status: "EXPIRED",
            },
          });

          // RELEASE TOTAL ROOM
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
        }
      });
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};
