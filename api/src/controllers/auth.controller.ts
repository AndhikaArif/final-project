import type { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/auth.service.js";
import { signJwt } from "../utils/jwt.util.js";

export class AuthController {
  private service = new AuthService();

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role, name } = req.body;

      await this.service.register({
        email,
        role,
        name,
      });

      res.status(201).json({
        message: "Verification email sent. Please check your inbox.",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      await this.service.verifyEmail({
        token,
        password,
      });

      res.json({
        message: "Account verified. Please login.",
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.login({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      });

      const token = signJwt({
        authAccountId: result.authAccountId,
        role: result.role,
      });

      res.cookie("authenticationToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res.json({
        message: "Login success",
        role: result.role,
        profile: result.profile,
      });
    } catch (error) {
      next(error);
    }
  }
}
