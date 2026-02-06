import type { Request, Response, NextFunction } from "express";
import type { Role } from "../generated/prisma/enums.js";

export class AuthorizationMiddleware {
  static allowRoles(...roles: Role[]) {
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
}
