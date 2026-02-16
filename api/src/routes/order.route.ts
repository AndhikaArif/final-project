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
  .post(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("USER"),
    orderController.getAllUserOrders,
  );

router
  .route("/orders")
  .post(
    AuthenticationMiddleware.verifyToken,
    AuthorizationMiddleware.allowRoles("TENANT"),
    orderController.getAllUserOrders,
  );

router
  .route("/:id")
  .post(AuthenticationMiddleware.verifyToken, orderController.getOrderById);

export default router;
