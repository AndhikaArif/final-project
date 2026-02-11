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

  async loginSocial(payload: ILoginSocialPayload) {
    const authAccount = await prisma.authAccount.findUnique({
      where: { email: payload.email },
      include: {
        user: true,
        tenant: true,
      },
    });

    // ❌ belum pernah daftar → harus register social
    if (!authAccount) {
      throw new AppError(404, "Account not registered");
    }

    // 🔒 provider check
    if (authAccount.provider !== payload.provider) {
      throw new AppError(403, "Invalid auth provider");
    }

    // 🔒 role check
    if (authAccount.role !== payload.role) {
      throw new AppError(403, "Unauthorized role access");
    }

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
      profile,
    };
  }
}
