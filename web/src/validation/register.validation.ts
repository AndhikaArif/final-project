import { z } from "zod";

export const registerSchemaFront = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("USER"),
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters"),
    email: z.email({ error: "Invalid email format" }),
  }),
  z.object({
    role: z.literal("TENANT"),
    email: z.email({ error: "Invalid email format" }),
    storeName: z
      .string({ error: "Store name is required" })
      .trim()
      .min(3, "Store name must be at least 3 characters"),

    storeAddress: z
      .string({ error: "Store address is required" })
      .trim()
      .min(5, "Store address must be at least 5 characters"),
  }),
]);

export type RegisterFormType = z.infer<typeof registerSchemaFront>;
