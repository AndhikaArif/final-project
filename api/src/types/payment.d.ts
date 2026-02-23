import type { StatusPayment } from "../generated/prisma/enums.ts";

export interface ICreatePayment {
  orderId: string;
  totalPaid: number;
}

export interface IUpdatePaymentProof {
  id: string;
  paymentProof: Express.Multer.File;
  userId: string;
}

export interface IUpdatePaymentStatus {
  id: string;
  status: StatusPayment;
  tenantId: string;
}
