import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { generateResetToken } from "../utils/token.util.js";
import type { IResetPasswordPayload } from "../types/auth.type.js";

export class PasswordService {
  async forgotPassword(email: string) {
    const account = await prisma.authAccount.findUnique({
      where: { email },
    });

    if (!account) return;
    if (account.provider !== "EMAIL") return;
    if (account.verificationStatus !== "VERIFIED") return;

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
    console.log("RESET TOKEN:", rawToken);
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

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await prisma.$transaction([
      prisma.authAccount.update({
        where: { id: record.authAccountId },
        data: {
          password: hashedPassword,
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
