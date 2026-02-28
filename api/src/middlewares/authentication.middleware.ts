import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.lib.js";
import type { CustomJwtPayload } from "../types/auth.type.js";

export class AuthenticationMiddleware {
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.authenticationToken;

      if (!token) {
        return res.status(401).json({
          message: "Unauthenticated. Please login first",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as CustomJwtPayload;

      // ambil tokenVersion terbaru dari DB
      const account = await prisma.authAccount.findUnique({
        where: { id: decoded.authAccountId },
        select: { tokenVersion: true },
      });

      if (!account || account.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({
          message: "Session expired. Please login again.",
        });
      }

      req.currentUser = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  }
}
