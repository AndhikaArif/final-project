import bcrypt from "bcryptjs";
import { createHash } from "crypto";

import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { EmailUtil } from "../utils/email.util.js";
import { generateToken } from "../utils/token.util.js";
import type {
  IRegisterPayload,
  IRegisterSocialPayload,
  ILoginPayload,
  ILoginSocialPayload,
} from "../types/auth.type.js";

const emailUtil = new EmailUtil();

export class AuthService {
  async register(payload: IRegisterPayload) {
    const existing = await prisma.authAccount.findUnique({
      where: { email: payload.email },
    });

    // ===============================
    // CASE 1: EMAIL SUDAH ADA
    // ===============================
    if (existing) {
      if (existing.verificationStatus === "VERIFIED") {
        throw new AppError(400, "Email already registered");
      }

      const rawToken = generateToken();
      const hashedToken = createHash("sha256").update(rawToken).digest("hex");

      await prisma.verificationToken.deleteMany({
        where: { authAccountId: existing.id },
      });

      await prisma.verificationToken.create({
        data: {
          token: hashedToken,
          expiredAt: new Date(Date.now() + 60 * 60 * 1000),
          authAccountId: existing.id,
        },
      });

      try {
        await emailUtil.sendVerificationEmail(payload.email, rawToken);

        return {
          message: "Verification email resent",
          emailSent: true,
        };
      } catch (error) {
        console.error("Email failed:", error);

        return {
          message:
            "Account already exists but failed to resend email. Please try again.",
          emailSent: false,
        };
      }
    }

    // ===============================
    // CASE 2: EMAIL BELUM ADA
    // ===============================
    const rawToken = generateToken();
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.$transaction(async (tx) => {
      const account = await tx.authAccount.create({
        data: {
          email: payload.email,
          role: payload.role,
        },
      });

      if (payload.role === "USER") {
        if (!payload.name) {
          throw new AppError(400, "Name is required for user");
        }

        await tx.user.create({
          data: {
            authAccountId: account.id,
            name: payload.name,
          },
        });
      }

      if (payload.role === "TENANT") {
        if (!payload.storeName) {
          throw new AppError(400, "Store name is required for tenant");
        }

        await tx.tenant.create({
          data: {
            authAccountId: account.id,
            storeName: payload.storeName,
            storeAddress: payload.storeAddress ?? null,
          },
        });
      }

      await tx.verificationToken.create({
        data: {
          token: hashedToken,
          expiredAt: new Date(Date.now() + 60 * 60 * 1000),
          authAccountId: account.id,
        },
      });

      return account;
    });

    try {
      await emailUtil.sendVerificationEmail(payload.email, rawToken);

      return {
        message: "Verification email sent",
        emailSent: true,
      };
    } catch (error) {
      console.error("Email failed:", error);

      return {
        message:
          "Account created but failed to send verification email. Please resend verification.",
        emailSent: false,
      };
    }
  }

  async registerSocial(payload: IRegisterSocialPayload) {
    const existing = await prisma.authAccount.findUnique({
      where: { email: payload.email },
      include: { user: true, tenant: true },
    });

    if (existing) {
      if (existing.provider !== payload.provider) {
        throw new AppError(403, "Invalid auth provider");
      }

      if (existing.role !== payload.role) {
        throw new AppError(403, "Unauthorized role access");
      }

      return {
        authAccountId: existing.id,
        role: existing.role,
        tokenVersion: existing.tokenVersion,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.authAccount.create({
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

        await tx.user.create({
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

        await tx.tenant.create({
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
        tokenVersion: account.tokenVersion,
      };
    });

    return result;
  }

  async loginSocial(payload: ILoginSocialPayload) {
    const authAccount = await prisma.authAccount.findUnique({
      where: { email: payload.email },
      include: {
        user: true,
        tenant: true,
      },
    });

    // Belum pernah daftar → kirim flag
    if (!authAccount) {
      return {
        needsRegistration: true,
      };
    }

    if (authAccount.provider !== payload.provider) {
      throw new AppError(403, "Invalid auth provider");
    }

    if (authAccount.role !== payload.role) {
      throw new AppError(403, "Unauthorized role access");
    }

    if (authAccount.verificationStatus !== "VERIFIED") {
      throw new AppError(403, "Account not verified");
    }

    const profile =
      authAccount.role === "USER" ? authAccount.user : authAccount.tenant;

    if (!profile) {
      throw new AppError(500, "Profile not found");
    }

    return {
      authAccountId: authAccount.id,
      role: authAccount.role,
      tokenVersion: authAccount.tokenVersion,
      profile,
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
      tokenVersion: authAccount.tokenVersion,
      profile,
    };
  }
}
