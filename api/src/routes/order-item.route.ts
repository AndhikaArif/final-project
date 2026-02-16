// import express from "express";
// import { OrderItemController } from "../controllers/order-item.controller.js";
// import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
// import { AuthorizationMiddleware } from "../middlewares/authorization.middleware.js";

// const orderItemController = new OrderItemController();

// const router = express.Router();

// router.route("/create").post(orderItemController.createOrderItem);
// router
//   .route("/history")
//   .get(
//     AuthenticationMiddleware.verifyToken,
//     AuthorizationMiddleware.allowRoles("USER"),
//     orderItemController.getAllCustomerOrderItems,
//   );

// export default router;
