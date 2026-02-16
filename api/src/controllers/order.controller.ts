import { type Request, type Response, type NextFunction } from "express";
import { OrderService } from "../services/order.service.js";
import { type ICreateOrderItem } from "../types/order-item.js";
import { StatusOrder } from "../generated/prisma/enums.js";

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.id;

      const { items } = req.body as {
        items: ICreateOrderItem[];
      };

      const order = await orderService.createOrder(userId, items);

      res.status(201).json({ message: "Success create order", order });
    } catch (error) {
      next(error);
    }
  }

  async getAllUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;

      const orders = await orderService.getAllUserOrders(userId, page, limit);

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getAllTenantOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      let status: StatusOrder | undefined;

      if (
        req.query.status &&
        Object.values(StatusOrder).includes(req.query.status as StatusOrder)
      ) {
        status = req.query.status as StatusOrder;
      }

      const orders = await orderService.getAllTenantOrders(
        tenantId,
        page,
        limit,
        status,
      );

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const currentUser = req.currentUser;

      const order = await orderService.getOrderById(id, currentUser);

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
}
