import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { CustomJwtPayload } from "../types/auth.type.js";

export class AuthenticationMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.authenticationToken;

      if (!token) {
        return res.status(401).json({
          message: "Unauthenticated. Please login first",
        });
      }

      const verifiedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as CustomJwtPayload;

      req.currentUser = verifiedToken;
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}
