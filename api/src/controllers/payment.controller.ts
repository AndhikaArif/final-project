import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import { CreatePaymentService } from "../services/payment/create-payment.service.js";
import { GetAllPayments } from "../services/payment/get-all-payments.service.js";
import { GetPaymentById } from "../services/payment/get-payment-by-id.service.js";
import { UpdatePayment } from "../services/payment/update-payment.service.js";

const createPayment = new CreatePaymentService();
const getAllPayments = new GetAllPayments();
const getPaymentById = new GetPaymentById();
const updatePayment = new UpdatePayment();

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.body;

      const payment = await createPayment.createPayment(orderId);

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

      const payments = await getAllPayments.getAllPayment(
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

      const payments = await getAllPayments.getAllPaymentForApproval(
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

      const payment = await getPaymentById.getPaymentById(id, currentUser);

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

      const updatedPayment = await updatePayment.updatePaymentProof({
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

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;

      const tenantId = req.currentUser.id;

      const result = await updatePayment.updatePaymentStatus({
        id,
        status,
        tenantId,
      });

      res.status(200).json({
        message: "Payment status updated successfully",
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}
