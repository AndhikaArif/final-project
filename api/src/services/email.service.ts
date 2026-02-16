import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { EmailUtil } from "../utils/email.util.js";
import { generateToken } from "../utils/token.util.js";
import type { IVerifyEmailPayload } from "../types/auth.type.js";

const emailUtil = new EmailUtil();

export class EmailService {
  async verifyEmail(payload: IVerifyEmailPayload) {
    const hashedToken = createHash("sha256")
      .update(payload.token)
      .digest("hex");

    const record = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
      include: { authAccount: true },
    });

    if (!record) {
      throw new AppError(400, "Invalid verification token");
    }

    if (record.authAccount.verificationStatus === "VERIFIED") {
      throw new AppError(400, "Account already verified");
    }

    if (record.expiredAt < new Date()) {
      throw new AppError(401, "Verification token expired");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    await prisma.authAccount.update({
      where: { id: record.authAccountId },
      data: {
        password: hashedPassword,
        verificationStatus: "VERIFIED",
      },
    });

    await prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return {
      message: "Account verified successfully. Please login.",
    };
  }

  async resendVerification(email: string) {
    const account = await prisma.authAccount.findUnique({
      where: { email },
    });

    if (!account) {
      throw new AppError(400, "No Account");
    }

    if (account.verificationStatus === "VERIFIED") {
      throw new AppError(400, "Account already verified");
    }

    // invalidate token lama
    await prisma.verificationToken.deleteMany({
      where: { authAccountId: account.id },
    });

    const rawToken = generateToken();
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.verificationToken.create({
      data: {
        token: hashedToken,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000),
        authAccountId: account.id,
      },
    });

    await emailUtil.sendVerificationEmail(account.email, rawToken);
  }
}
