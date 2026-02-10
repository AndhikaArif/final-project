import { prisma } from "../lib/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { type ICreateOrderItem } from "../types/order-item.js";

export class OrderItemService {
  async createOrder(data: ICreateOrderItem) {
    // check availability

    // STAY DURATION VALIDATION
    // invalid date
    if (
      isNaN(data.checkInDate.getTime()) ||
      isNaN(data.checkOutDate.getTime())
    ) {
      throw new AppError(400, "Invalid check-in or check-out date");
    }

    // normalized date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalizedCheckIn = new Date(data.checkInDate);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    const normalizedCheckOut = new Date(data.checkOutDate);
    normalizedCheckOut.setHours(0, 0, 0, 0);

    // past date
    if (normalizedCheckIn < today) {
      throw new AppError(400, "Check-in date cannot be in the past");
    }

    if (normalizedCheckOut < today) {
      throw new AppError(400, "Check-out date cannot be in the past");
    }

    // check-out before check-in
    if (normalizedCheckOut <= normalizedCheckIn) {
      throw new AppError(400, "Check-out date must be after check-in date");
    }

    // duration count
    const oneDay = 1000 * 60 * 60 * 24;
    const duration =
      (normalizedCheckOut.getTime() - normalizedCheckIn.getTime()) / oneDay;

    // minimal duration
    if (duration < 1) {
      throw new AppError(400, "Stay duration must be at least 1 night");
    }

    // TOTAL AMOUNT
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
    });

    const roomType = await prisma.roomType.findUnique({
      where: { id: room!.typeId },
    });

    const totalAmount = duration * roomType!.basePrice;

    // create order item
    const orderItem = await prisma.orderItem.create({
      data: { ...data, totalAmount },
    });
  }
}
