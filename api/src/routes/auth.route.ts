import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

const router = express.Router();
const authController = new AuthController();

router.post(
  "/register",
  RateLimitMiddleware.registerLimiter,
  authController.register,
);
router.post("/verify", authController.verifyEmail);
router.post("/login", RateLimitMiddleware.loginLimiter, authController.login);
router.post("/auth/social", authController.socialLogin);
router.post(
  "/forgot-password",
  RateLimitMiddleware.resetPasswordLimiter,
  authController.forgotPassword,
);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/resend-verification",
  RateLimitMiddleware.resendVerificationLimiter,
  authController.resendVerification,
);

export default router;
