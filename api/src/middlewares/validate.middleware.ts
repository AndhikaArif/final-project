// middlewares/validate.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export function validate(
  schema: ZodObject,
  target: "body" | "query" | "params",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      res.locals[target] = parsed; // simpan di locals
      next();
    } catch (err) {
      next(err);
    }
  };
}
