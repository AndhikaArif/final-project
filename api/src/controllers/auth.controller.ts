import type { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/auth.service.js";
import { EmailService } from "../services/email.service.js";
import { PasswordService } from "../services/password.service.js";
import { signJwt } from "../utils/jwt.util.js";
import { AuthValidation } from "../validations/auth.validation.js";
import { AppError } from "../errors/app.error.js";
import type { AuthJsPayload, AuthJsProvider } from "../types/auth.type.js";
import type { AuthProvider } from "../generated/prisma/enums.js";

const authService = new AuthService();
const emailService = new EmailService();
const passwordService = new PasswordService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = AuthValidation.registerSchema.parse(req.body);

      await authService.register(payload);

      res.status(201).json({
        message: "Verification email sent. Please check your inbox.",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = AuthValidation.verifyEmailSchema.parse(req.body);

      await emailService.verifyEmail(payload);

      res.json({
        message: "Account verified. Please login.",
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = AuthValidation.loginSchema.parse(req.body);

      const result = await authService.login(payload);

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

  async registerSocial(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.auth as AuthJsPayload | undefined;

      if (!auth?.email || !auth?.provider) {
        throw new AppError(401, "Unauthorized");
      }

      const { role, name, storeName, storeAddress } =
        AuthValidation.registerSocialSchema.parse(req.body);

      if (auth.provider === "credentials") {
        throw new AppError(400, "Invalid provider for social register");
      }

      const providerMap = {
        google: "GOOGLE",
        facebook: "FACEBOOK",
      } as const;

      const provider = providerMap[auth.provider];

      const result = await authService.registerSocial({
        email: auth.email,
        provider,
        role,
        name,
        storeName,
        storeAddress,
      });

      const token = signJwt({
        authAccountId: result.authAccountId,
        role: result.role,
      });

      res.status(201).json({
        message: "Social register success",
        role: result.role,
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  async loginSocial(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = req.auth as AuthJsPayload | undefined;

      if (!auth?.email || !auth?.provider) {
        throw new AppError(401, "Unauthorized");
      }

      const { role } = AuthValidation.loginSocialSchema.parse(req.body);

      const providerMap: Record<AuthJsProvider, AuthProvider> = {
        google: "GOOGLE",
        facebook: "FACEBOOK",
        credentials: "EMAIL",
      };

      const provider = providerMap[auth.provider];

      if (!provider) {
        throw new AppError(400, "Unsupported auth provider");
      }

      const result = await authService.loginSocial({
        email: auth.email, // TRUSTED
        provider, // dari auth.js session
        role,
      });

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
      const payload = AuthValidation.forgotPasswordSchema.parse(req.body);

      await passwordService.forgotPassword(payload.email);

      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = AuthValidation.resetPasswordSchema.parse(req.body);

      const result = await passwordService.resetPassword(payload);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = AuthValidation.resendVerificationSchema.parse(req.body);

      await emailService.resendVerification(payload.email);

      res.status(200).json({
        message: "Verification email sent",
      });
    } catch (err) {
      next(err);
    }
  }
}
