import { z } from "zod";

export const socialRegisterSchema = z
  .object({
    role: z.enum(["USER", "TENANT"]),
    name: z.string().optional(),
    storeName: z.string().optional(),
    storeAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "USER") {
      if (!data.name || data.name.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "Name must be at least 3 characters",
          path: ["name"],
        });
      }
    }

    if (data.role === "TENANT") {
      if (!data.storeName || data.storeName.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "Store name must be at least 3 characters",
          path: ["storeName"],
        });
      }
    }
  });
