import type { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/auth.service.js";
import { signJwt } from "../utils/jwt.util.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role, name, storeName, storeAddress } = req.body;

      await authService.register({
        email,
        role,
        name,
        storeName,
        storeAddress,
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

      if (!token || !password) {
        return res.status(400).json({
          message: "Token and password are required for verification",
        });
      }

      if (typeof password !== "string" || password.trim().length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }

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
        secure: process.env.NODE_ENV === "production",
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

  async socialLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerSocial(req.body);

      const token = signJwt({
        authAccountId: result.authAccountId,
        role: result.role,
      });

      res.status(200).json({
        message: "Social login success",
        role: result.role,
        token,
      });
    } catch (err) {
      next(err);
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

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await authService.resendVerification(email);

      res.status(200).json({
        message: "Verification email sent",
      });
    } catch (err) {
      next(err);
    }
  }
}
