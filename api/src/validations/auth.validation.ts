import { z } from "zod";
import { Role } from "../generated/prisma/enums.js";

export class AuthValidation {
  static loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    role: z.enum(Role),
  });
}
