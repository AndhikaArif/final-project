import type { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/auth.service.js";
import { signJwt } from "../utils/jwt.util.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role, name } = req.body;

      await authService.register({
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

      await authService.verifyEmail({
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
      const result = await authService.login({
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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await authService.forgotPassword(email);

      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          message: "Token and new password are required",
        });
      }

      const result = await authService.resetPassword({
        token,
        newPassword,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
