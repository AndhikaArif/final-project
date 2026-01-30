import jwt from "jsonwebtoken";
import type { CustomJwtPayload } from "../types/auth.type.d.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "7d";

export function signJwt(payload: CustomJwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
}
