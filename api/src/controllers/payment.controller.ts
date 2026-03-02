import { type Request, type Response, type NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";
import { AppError } from "../errors/app.error.js";

const paymentService = new PaymentService();

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.body;

      const payment = await paymentService.createPayment(orderId);

      res.status(201).json({ message: "Success create payment", payment });
    } catch (error) {
      next(error);
    }
  }

  async getAllPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const payments = await paymentService.getAllPayment(
        tenantId,
        page,
        limit,
      );

      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

  async getAllPaymentForApproval(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const tenantId = req.currentUser.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const payments = await paymentService.getAllPaymentForApproval(
        tenantId,
        page,
        limit,
      );

      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const currentUser = req.currentUser;

      const payment = await paymentService.getPaymentById(id, currentUser);

      res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = req.currentUser.id;

      const paymentProof = req.file as Express.Multer.File;

      if (!paymentProof) {
        throw new AppError(400, "Payment proof file is required");
      }

      const updatedPayment = await paymentService.updatePaymentProof({
        id,
        userId,
        paymentProof,
      });

      res
        .status(200)
        .json({ message: "Success upload payment proof", updatedPayment });
    } catch (error) {
      next(error);
    }
  }
}
