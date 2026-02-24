import { z } from "zod";

export const loginSchemaFront = z.object({
  email: z.email({ error: "Invalid email format" }),
  password: z.string().trim().min(1, "Password is required"),
});

export type LoginFormType = z.infer<typeof loginSchemaFront>;
