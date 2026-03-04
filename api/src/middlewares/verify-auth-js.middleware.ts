import type { Request, Response, NextFunction } from "express";
import { decode } from "next-auth/jwt";
import { AppError } from "../errors/app.error.js";
import type { AuthJsProvider } from "../types/auth.type.js";

export async function verifyAuthJs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError(401, "Unauthorized"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError(401, "Unauthorized"));
    }

    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      throw new Error("AUTHJS_SECRET not configured");
    }

    const decoded = await decode({
      token,
      secret,
    });

    if (!decoded?.email || !decoded?.provider) {
      return next(new AppError(401, "Invalid token payload"));
    }

    req.auth = {
      email: decoded.email as string,
      provider: decoded.provider as AuthJsProvider,
    };

    next();
  } catch {
    next(new AppError(401, "Invalid token"));
  }
}
