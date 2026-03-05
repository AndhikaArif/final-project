import express from "express";
import { OrderController } from "../controllers/order.controller.js";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware.js";

const orderController = new OrderController();

const router = express.Router();

router
  .route("/create")
  .post(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("USER"),
    orderController.createOrder,
  );

router
  .route("/history")
  .get(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("USER"),
    orderController.getAllUserOrders,
  );

router
  .route("/tenant")
  .get(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("TENANT"),
    orderController.getAllTenantOrders,
  );

router
  .route("/:id")
  .get(AuthenticationMiddleware.verifyToken, orderController.getOrderById);

router
  .route("/:id/cancel")
  .patch(AuthenticationMiddleware.verifyToken, orderController.cancelOrder);

export default router;
