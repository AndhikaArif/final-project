import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { AuthJsProvider } from "../types/auth.type.js";

export function verifyAuthJs(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new AppError(401, "Unauthorized"));
  }

  const secret = process.env.AUTHJS_SECRET;
  if (!secret) {
    throw new Error("AUTHJS_SECRET not configured");
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload & {
      email?: string;
      provider?: AuthJsProvider;
    };

    if (!payload.email || !payload.provider) {
      return next(new AppError(401, "Invalid token payload"));
    }

    req.auth = {
      email: payload.email,
      provider: payload.provider,
    };

    next();
  } catch {
    next(new AppError(401, "Invalid token"));
  }
}
