import bcrypt from "bcryptjs";
import { Role } from "../generated/index.js";

import { prisma } from "../configs/prisma.config.js";
import { AppError } from "../errors/app.error.js";
import { EmailUtil } from "../utils/email.util.js";
import { generateToken } from "../utils/token.js";

const emailUtil = new EmailUtil();

export class AuthService {
  async register(payload: {
    email: string;
    role: Role;
    name?: string; // USER
    storeName?: string; // TENANT
    storeAddress?: string;
  }) {
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
          storeAddress: payload.storeAddress,
        },
      });
    }

    // Create verification token
    const token = generateToken();

    await prisma.verificationToken.create({
      data: {
        token,
        expiredAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        authAccountId: authAccount.id,
      },
    });

    // Send email
    await emailUtil.sendVerificationEmail(payload.email, token);

    return {
      message: "Verification email sent",
    };
  }

  async verifyEmail(payload: { token: string; password: string }) {
    const record = await prisma.verificationToken.findUnique({
      where: { token: payload.token },
      include: { authAccount: true },
    });

    if (!record) {
      throw new AppError(400, "Invalid verification token");
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

  async login(payload: { email: string; password: string; role: Role }) {
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
}
