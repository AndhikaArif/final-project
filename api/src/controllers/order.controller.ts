import { type Request, type Response, type NextFunction } from "express";
import { CreateOrderService } from "../services/order/create-order.service.js";
import { GetAllOrders } from "../services/order/get-all-orders.service.js";
import { GetOrderById } from "../services/order/get-order-by-id.service.js";
import { CancelOrderService } from "../services/cancel-order.service.js";
import { StatusOrder } from "../generated/prisma/enums.js";

const createOrderService = new CreateOrderService();
const getAllOrders = new GetAllOrders();
const getOrderById = new GetOrderById();
const cancelOrderService = new CancelOrderService();

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.id;

      const { contact, items } = req.body;

      const result = await createOrderService.createOrder(
        userId,
        contact,
        items,
      );

      res.status(201).json({ message: "Success create order", result });
    } catch (error) {
      next(error);
    }
  }

  async getAllUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.currentUser.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;

      const orders = await getAllOrders.getAllUserOrders(userId, page, limit);

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

      const orders = await getAllOrders.getAllTenantOrders(
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

      const order = await getOrderById.getOrderById(id, currentUser);

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const currentUser = req.currentUser;

      const result = await cancelOrderService.cancelOrder(id, currentUser);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
