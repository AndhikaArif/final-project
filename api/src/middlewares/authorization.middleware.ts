import type { Request, Response, NextFunction } from "express";

export class AuthorizationMiddleware {
  static allowRoles(...roles: Array<"USER" | "TENANT">) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.currentUser) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      if (!roles.includes(req.currentUser.role)) {
        return res.status(403).json({
          message: "Forbidden: insufficient role",
        });
      }

      next();
    };
  }

  static tenantOnly(req: Request, res: Response, next: NextFunction) {
    if (req.currentUser?.role !== "TENANT") {
      return res.status(403).json({
        message: "Tenant access only",
      });
    }
    next();
  }

  static userOnly(req: Request, res: Response, next: NextFunction) {
    if (req.currentUser?.role !== "USER") {
      return res.status(403).json({
        message: "User access only",
      });
    }
    next();
  }
}
