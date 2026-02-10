import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller.js";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { BusinessRuleMiddleware } from "../middlewares/business-rule.middleware.js";
import { fileUpload } from "../middlewares/file-upload.middleware.js";

const router = Router();
const controller = new ProfileController();

router.put(
  "/profile",
  AuthenticationMiddleware.verifyToken,
  BusinessRuleMiddleware.requireVerifiedAccount(),
  controller.updateProfile,
);

router.post(
  "/profile/image",
  AuthenticationMiddleware.verifyToken,
  BusinessRuleMiddleware.requireVerifiedAccount(),
  fileUpload().single("image"),
  controller.uploadProfileImage,
);

router.put(
  "/profile/email",
  AuthenticationMiddleware.verifyToken,
  controller.updateEmail,
);

router.put(
  "/profile/password",
  AuthenticationMiddleware.verifyToken,
  BusinessRuleMiddleware.requireVerifiedAccount(),
  controller.changePassword,
);

export default router;
