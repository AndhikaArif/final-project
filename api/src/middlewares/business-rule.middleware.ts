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

  static tenantVerifiedOnly(req: Request, res: Response, next: NextFunction) {
    if (
      req.currentUser?.role === "TENANT" &&
      req.currentUser.verificationStatus !== "VERIFIED"
    ) {
      return res.status(403).json({
        message: "Tenant not verified",
      });
    }
    next();
  }
}
