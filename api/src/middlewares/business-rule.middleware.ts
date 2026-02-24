import type { Request, Response, NextFunction } from "express";
import { prisma } from "../libs/prisma.lib.js";

export class BusinessRuleMiddleware {
  static requireVerifiedAccount() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const authAccountId = req.currentUser?.authAccountId;

      if (!authAccountId) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      const account = await prisma.authAccount.findUnique({
        where: { id: authAccountId },
        select: { verificationStatus: true },
      });

      if (!account || account.verificationStatus !== "VERIFIED") {
        return res.status(403).json({
          message: "Account not verified",
        });
      }

      next();
    };
  }

  static requireTenantVerified() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const authAccountId = req.currentUser?.authAccountId;

      if (!authAccountId) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      const account = await prisma.authAccount.findUnique({
        where: { id: authAccountId },
        select: { role: true, verificationStatus: true },
      });

      if (!account || account.role !== "TENANT") {
        return res.status(403).json({ message: "Not a tenant" });
      }

      if (account.verificationStatus !== "VERIFIED") {
        return res.status(403).json({ message: "Tenant not verified" });
      }

      next();
    };
  }
}
