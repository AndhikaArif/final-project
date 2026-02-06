import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import fs from "fs/promises";

import cloudinary from "../configs/cloudinary.config.js";
import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { generateToken } from "../utils/token.util.js";
import type { IExistingUserProfile } from "../types/auth.type.js";
import { EmailUtil } from "../utils/email.util.js";

const emailUtil = new EmailUtil();

export class ProfileService {
  async myProfile(authAccountId: string): Promise<IExistingUserProfile> {
    const account = await prisma.authAccount.findUnique({
      where: { id: authAccountId },
      include: {
        user: true,
        tenant: true,
      },
    });

    if (!account) {
      throw new AppError(404, "User not found");
    }

    if (account.role === "USER") {
      return {
        id: account.id,
        email: account.email,
        role: account.role,
        ...(account.user?.name && { name: account.user.name }),
      };
    }

    return {
      id: account.id,
      email: account.email,
      role: account.role,
      ...(account.tenant?.storeName && {
        storeName: account.tenant.storeName,
      }),
      ...(account.tenant?.storeAddress && {
        storeAddress: account.tenant.storeAddress,
      }),
    };
  }

  async updateProfile(
    authAccountId: string,
    payload: {
      name?: string;
      storeName?: string;
      storeAddress?: string;
    },
  ) {
    const account = await prisma.authAccount.findUnique({
      where: { id: authAccountId },
      include: { user: true, tenant: true },
    });

    if (!account) {
      throw new AppError(404, "User not found");
    }

    if (account.role === "USER") {
      if (!payload.name) {
        throw new AppError(400, "Name is required");
      }

      await prisma.user.update({
        where: { authAccountId },
        data: { name: payload.name },
      });
    }

    if (
      account.role === "TENANT" &&
      !payload.storeName &&
      !payload.storeAddress
    ) {
      throw new AppError(400, "No data to update");
    }

    if (account.role === "TENANT") {
      await prisma.tenant.update({
        where: { authAccountId },
        data: {
          ...(payload.storeName && { storeName: payload.storeName }),
          ...(payload.storeAddress && { storeAddress: payload.storeAddress }),
        },
      });
    }

    return { message: "Profile updated successfully" };
  }

  async uploadProfileImage(authAccountId: string, file: Express.Multer.File) {
    const account = await prisma.authAccount.findUnique({
      where: { id: authAccountId },
      include: { user: true, tenant: true },
    });

    if (!account) throw new AppError(404, "User not found");

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profiles",
    });

    // hapus file lokal setelah upload
    await fs.unlink(file.path);

    if (account.role === "USER") {
      await prisma.user.update({
        where: { authAccountId },
        data: { profileImage: result.secure_url },
      });
    }

    if (account.role === "TENANT") {
      await prisma.tenant.update({
        where: { authAccountId },
        data: { logo: result.secure_url },
      });
    }

    return { message: "Profile image updated" };
  }

  async updateEmail(authAccountId: string, newEmail: string) {
    const exists = await prisma.authAccount.findUnique({
      where: { email: newEmail },
    });

    if (exists) {
      throw new AppError(400, "Email already in use");
    }

    const account = await prisma.authAccount.findUnique({
      where: { id: authAccountId },
    });

    if (account?.provider !== "EMAIL") {
      throw new AppError(
        400,
        "Email cannot be changed for social login accounts",
      );
    }

    await prisma.authAccount.update({
      where: { id: authAccountId },
      data: {
        email: newEmail,
        verificationStatus: "PENDING",
      },
    });

    await prisma.verificationToken.deleteMany({
      where: { authAccountId },
    });

    const rawToken = generateToken();
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.verificationToken.create({
      data: {
        token: hashedToken,
        expiredAt: new Date(Date.now() + 60 * 60 * 1000),
        authAccountId,
      },
    });

    await emailUtil.sendVerificationEmail(newEmail, rawToken);

    return { message: "Email updated. Please verify again." };
  }

  async changePassword(
    authAccountId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const account = await prisma.authAccount.findUnique({
      where: { id: authAccountId },
    });

    if (!account || !account.password) {
      throw new AppError(400, "Invalid account");
    }

    if (account.provider !== "EMAIL") {
      throw new AppError(400, "Password change not allowed for social login");
    }

    if (oldPassword === newPassword) {
      throw new AppError(400, "New password must be different");
    }

    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      throw new AppError(400, "Old password incorrect");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.authAccount.update({
      where: { id: authAccountId },
      data: { password: hashed },
    });

    return { message: "Password updated successfully" };
  }
}
