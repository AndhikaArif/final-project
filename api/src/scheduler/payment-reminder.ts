import cron from "node-cron";
import { prisma } from "../libs/prisma.lib.js";
import { EmailUtil } from "../utils/email.util.js";

const emailUtil = new EmailUtil();

const BATCH_SIZE = 50;

export const paymentReminderScheduler = () => {
  cron.schedule("*/2 * * * *", async () => {
    console.log("Running payment reminder job...");

    const now = new Date();

    try {
      // PAYMENT REMINDER
      const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);

      const ordersToRemind = await prisma.order.findMany({
        where: {
          status: "WAITING_PAYMENT",
          reminderSent: false,
          expiredAt: {
            not: null,
            lte: reminderTime,
            gt: now,
          },
        },
        select: {
          id: true,
          expiredAt: true,
          user: {
            select: {
              authAccount: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        take: BATCH_SIZE,
      });

      for (const order of ordersToRemind) {
        const email = order.user?.authAccount?.email;

        if (!order.expiredAt) continue;

        if (email) {
          try {
            await emailUtil.sendPaymentReminderEmail(email, {
              orderId: order.id,
              expiredAt: order.expiredAt,
            });
          } catch (error) {
            console.error("Failed to send reminder email", error);
          }
        }

        await prisma.order.update({
          where: { id: order.id },
          data: { reminderSent: true },
        });
      }

      // AUTO EXPIRE ORDER
      const expiredOrders = await prisma.order.findMany({
        where: {
          status: "WAITING_PAYMENT",
          expiredAt: {
            lte: now,
          },
        },
        select: {
          id: true,
        },
        take: BATCH_SIZE,
      });

      for (const order of expiredOrders) {
        console.log(`Expiring order ${order.id}`);

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });

          await tx.payment.updateMany({
            where: {
              orderId: order.id,
              status: "PENDING",
            },
            data: {
              status: "EXPIRED",
            },
          });
        });
      }
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};
