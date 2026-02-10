import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { EmailUtil } from "../utils/email.util.js";
import { generateToken, generateResetToken } from "../utils/token.util.js";
import type {
  IRegisterPayload,
  IRegisterSocialPayload,
  ILoginPayload,
  IResetPasswordPayload,
  IVerifyEmailPayload,
} from "../types/auth.type.js";

const emailUtil = new EmailUtil();

export class AuthService {
  async register(payload: IRegisterPayload) {
    const existing = await prisma.authAccount.findUnique({
      where: { email: payload.email },
    });

    if (existing) {
      throw new AppError(400, "Email already registered");
    }

    // Create AuthAccount
    const authAccount = await prisma.authAccount.create({
      data: {
        email: payload.email,
        role: payload.role,
      },
    });

    // Create profile based on role user
    if (payload.role === "USER") {
      if (!payload.name) {
        throw new AppError(400, "Name is required for user");
      }

      await prisma.user.create({
        data: {
          authAccountId: authAccount.id,
          name: payload.name,
        },
      });
    }

    // Create profile based on role tenant
    if (payload.role === "TENANT") {
      if (!payload.storeName) {
        throw new AppError(400, "Store name is required for tenant");
      }

      await prisma.tenant.create({
        data: {
          authAccountId: authAccount.id,
          storeName: payload.storeName,
          storeAddress: payload.storeAddress ?? null,
        },
      });
    }

    // Create verification token
    const rawToken = generateToken();
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.verificationToken.create({
      data: {
        token: hashedToken,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000), // 1hour
        authAccountId: authAccount.id,
      },
    });

    await emailUtil.sendVerificationEmail(payload.email, rawToken);

    return {
      message: "Verification email sent",
    };
  }

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

  async registerSocial(payload: IRegisterSocialPayload) {
    const existing = await prisma.authAccount.findUnique({
      where: { email: payload.email },
      include: { user: true, tenant: true },
    });

    if (existing) {
      if (existing && existing.role !== payload.role) {
        throw new AppError(403, "Unauthorized role access");
      }

      return {
        authAccountId: existing.id,
        role: existing.role,
      };
    }

    const account = await prisma.authAccount.create({
      data: {
        email: payload.email,
        role: payload.role,
        provider: payload.provider,
        verificationStatus: "VERIFIED",
      },
    });

    if (payload.role === "USER") {
      if (!payload.name) {
        throw new AppError(400, "Name is required");
      }

      await prisma.user.create({
        data: {
          authAccountId: account.id,
          name: payload.name,
        },
      });
    }

    if (payload.role === "TENANT") {
      if (!payload.storeName) {
        throw new AppError(400, "Store name is required");
      }

      await prisma.tenant.create({
        data: {
          authAccountId: account.id,
          storeName: payload.storeName,
          storeAddress: payload.storeAddress ?? null,
        },
      });
    }

    return {
      authAccountId: account.id,
      role: account.role,
    };
  }

  async login(payload: ILoginPayload) {
    const authAccount = await prisma.authAccount.findUnique({
      where: { email: payload.email },
      include: {
        user: true,
        tenant: true,
      },
    });

    if (!authAccount) {
      throw new AppError(400, "Invalid email or password");
    }

    // 🔒 provider check
    if (authAccount.provider !== "EMAIL") {
      throw new AppError(
        400,
        "This account uses social login. Please login with provider.",
      );
    }

    // 🔒 role check
    if (authAccount.role !== payload.role) {
      throw new AppError(403, "Unauthorized role access");
    }

    // 🔒 verification check
    if (authAccount.verificationStatus !== "VERIFIED") {
      throw new AppError(403, "Account not verified");
    }

    if (!authAccount.password) {
      throw new AppError(400, "Password not set");
    }

    // 🔐 compare password
    const isMatch = await bcrypt.compare(
      payload.password,
      authAccount.password,
    );

    if (!isMatch) {
      throw new AppError(400, "Invalid email or password");
    }

    // select profile
    const profile =
      authAccount.role === "USER" ? authAccount.user : authAccount.tenant;

    if (!profile) {
      throw new AppError(500, "Profile not found");
    }

    return {
      authAccountId: authAccount.id,
      role: authAccount.role,
      profile,
    };
  }

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
