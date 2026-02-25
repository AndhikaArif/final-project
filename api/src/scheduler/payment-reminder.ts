import cron from "node-cron";
import { prisma } from "../libs/prisma.lib.js";

export const paymentReminderScheduler = () => {
  // jalan tiap 1 menit
  cron.schedule("* * * * *", async () => {
    console.log("Running payment reminder job...");

    const now = new Date();

    try {
      await prisma.$transaction(async (tx) => {
        /**
         * ===============================
         * 1️⃣ REMINDER (10 menit sebelum expired)
         * ===============================
         */
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

          // TODO: kirim email / notification di sini

          await tx.order.update({
            where: { id: order.id },
            data: { reminderSent: true },
          });
        }

        /**
         * ===============================
         * 2️⃣ AUTO EXPIRE
         * ===============================
         */
        const expiredOrders = await tx.order.findMany({
          where: {
            status: "WAITING_PAYMENT",
            expiredAt: {
              lte: now,
            },
          },
          include: {
            payments: true,
          },
        });

        for (const order of expiredOrders) {
          console.log(`Expiring order ${order.id}`);

          // Update order status
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });

          // Update payment status jika ada
          if (order.payments) {
            await tx.payment.updateMany({
              where: {
                orderId: order.id,
                status: "PENDING",
              },
              data: {
                status: "EXPIRED",
              },
            });
          }
          // Release booked room
          await tx.bookedRooms.deleteMany({
            where: {
              orderItem: {
                orderId: order.id,
              },
            },
          });
        }
      });
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};
