import { z } from "zod";
import { Role } from "../generated/prisma/enums.js";

export class AuthValidation {
  static registerSchema = z
    .object({
      email: z.email("Invalid email format"),
      role: z.enum(Role),
      name: z.string().trim().min(1, "Name is required"),
      storeName: z.string().trim().optional(),
      storeAddress: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "TENANT") {
        if (!data.storeName) {
          ctx.addIssue({
            code: "custom",
            message: "Store name is required for tenant",
            path: ["storeName"],
          });
        }

        if (!data.storeAddress) {
          ctx.addIssue({
            code: "custom",
            message: "Store address is required for tenant",
            path: ["storeAddress"],
          });
        }
      }
    });

  static verifyEmailSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  static loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().trim().min(1, "Password is required"),
  });

  static registerSocialSchema = z
    .object({
      role: z.enum(Role),
      name: z.string().optional(),
      storeName: z.string().optional(),
      storeAddress: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "TENANT") {
        if (!data.storeName) {
          ctx.addIssue({
            code: "custom",
            message: "Store name is required for tenant",
            path: ["storeName"],
          });
        }

        if (!data.storeAddress) {
          ctx.addIssue({
            code: "custom",
            message: "Store address is required for tenant",
            path: ["storeAddress"],
          });
        }
      }
    });

  static loginSocialSchema = z.object({
    role: z.enum(Role),
  });

  static forgotPasswordSchema = z.object({
    email: z.email("Invalid email format"),
  });

  static resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
  });

  static resendVerificationSchema = z.object({
    email: z.email("Invalid email format"),
  });
}
