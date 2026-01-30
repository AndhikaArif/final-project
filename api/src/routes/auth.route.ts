import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { BusinessRuleMiddleware } from "../middlewares/business-rule.middleware.js";

const router = express.Router();
const authController = new AuthController();

router.post("/auth/register", authController.register);
router.post("/auth/verify", authController.verifyEmail);
router.post("/auth/login", authController.login);

export default router;
