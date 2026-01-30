import type { Request, Response, NextFunction } from "express";

export class BusinessRuleMiddleware {
  static requireVerifiedAccount(message = "Account not verified") {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.currentUser?.isVerified) {
        return res.status(403).json({ message });
      }
      next();
    };
  }

  static tenantVerifiedOnly(req: Request, res: Response, next: NextFunction) {
    if (req.currentUser?.role === "TENANT" && !req.currentUser.isVerified) {
      return res.status(403).json({
        message: "Tenant not verified",
      });
    }
    next();
  }
}
