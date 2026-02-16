// import { type Request, type Response, type NextFunction } from "express";
// import { OrderItemService } from "../services/order-item.service.js";
// import type { ICreateOrderItem } from "../types/order-item.js";

// const orderItemService = new OrderItemService();

// export class OrderItemController {
//   async createOrderItem(req: Request, res: Response, next: NextFunction) {
//     try {
//       const data: ICreateOrderItem = req.body;

//       const orderItem = await orderItemService.createOrderItem(data);

//       res.status(201).json({ message: "Success create order item", orderItem });
//     } catch (error) {
//       next(error);
//     }
//   }

//     async getAllCustomerOrderItems(
//       req: Request,
//       res: Response,
//       next: NextFunction,
//     ) {
//       try {
//         const userId = req.currentUser.id;

//         const orderItem = await orderItemService.getAllCustomerOrderItems(userId);

//         res
//           .status(200)
//           .json({ message: "Success get all order history", orderItem });
//       } catch (error) {
//         next(error);
//       }
//     }
// }
