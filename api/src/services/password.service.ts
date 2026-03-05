import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { generateResetToken } from "../utils/token.util.js";
import type { IResetPasswordPayload } from "../types/auth.type.js";
import { EmailUtil } from "../utils/email.util.js";

const emailUtil = new EmailUtil();

export class PasswordService {
  async forgotPassword(email: string) {
    const account = await prisma.authAccount.findUnique({
      where: { email },
    });

    if (
      !account ||
      account.verificationStatus !== "VERIFIED" ||
      account.provider !== "EMAIL"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    if (account.verificationStatus !== "VERIFIED") return;
    if (account.provider !== "EMAIL") return;

    const { rawToken, hashedToken } = generateResetToken();
    const expiredAt = new Date(Date.now() + 1000 * 60 * 15); // 15 menit

    await prisma.resetPasswordToken.upsert({
      where: {
        authAccountId: account.id,
      },
      update: {
        token: hashedToken,
        expiredAt,
        usedAt: null,
      },
      create: {
        token: hashedToken,
        expiredAt,
        authAccountId: account.id,
      },
    });

    // kirim email
    const resetUrl = `${process.env.WEB_DOMAIN}/reset-password?token=${rawToken}`;
    await emailUtil.sendResetPasswordEmail(account.email, resetUrl);
  }

  async resetPassword(payload: IResetPasswordPayload) {
    const hashedToken = createHash("sha256")
      .update(payload.token)
      .digest("hex");

    const record = await prisma.resetPasswordToken.findUnique({
      where: { token: hashedToken },
      include: { authAccount: true },
    });

    if (!record) {
      throw new AppError(400, "Invalid reset token");
    }

    if (record.usedAt) {
      throw new AppError(400, "Reset token already used");
    }

    if (record.expiredAt < new Date()) {
      throw new AppError(400, "Reset token expired");
    }

    if (record.authAccount.provider !== "EMAIL") {
      throw new AppError(
        400,
        "Password reset not allowed for social login accounts",
      );
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await prisma.$transaction([
      prisma.authAccount.update({
        where: { id: record.authAccountId },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
      }),

      prisma.resetPasswordToken.update({
        where: { id: record.id },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return {
      message: "Password reset successful. Please login.",
    };
  }
}
