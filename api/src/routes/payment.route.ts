import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { upload } from "../configs/multer.config.js";

const paymentController = new PaymentController();

const router = express.Router();

router
  .route("/create")
  .post(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("USER"),
    paymentController.createPayment,
  );

router
  .route("/history")
  .get(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("TENANT"),
    paymentController.getAllPayment,
  );

router
  .route("/approval")
  .patch(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("TENANT"),
    paymentController.getAllPaymentForApproval,
  );

router
  .route("/:id")
  .get(AuthenticationMiddleware.verifyToken, paymentController.getPaymentById);

router
  .route("/:id/proof")
  .patch(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("USER"),
    upload.single("paymentProof"),
    paymentController.updatePaymentProof,
  );

router
  .route("/:id/status")
  .patch(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("TENANT"),
    paymentController.updatePaymentStatus,
  );

export default router;
