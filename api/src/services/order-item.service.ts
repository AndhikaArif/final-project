// import { prisma } from "../libs/prisma.lib.js";
// import { AppError } from "../errors/app.error.js";
// import { type ICreateOrderItem } from "../types/order-item.js";

// export class OrderItemService {
//   async createOrderItem(data: ICreateOrderItem) {
//     // ORDER ID
//     const order = await prisma.order.findUnique({
//       where: { id: data.orderId },
//     });

//     if (!order) {
//       throw new AppError(404, "Order not found");
//     }

//     if (order.status !== "WAITING_PAYMENT") {
//       throw new AppError(400, "Cannot add item to finalized order");
//     }

//     // ROOM TYPE ID
//     const roomType = await prisma.roomType.findUnique({
//       where: { id: data.roomTypeId },
//     });

//     if (!roomType) {
//       throw new AppError(404, "Room type not found");
//     }

//     // STAY DURATION VALIDATION
//     // invalid date
//     if (
//       isNaN(data.checkInDate.getTime()) ||
//       isNaN(data.checkOutDate.getTime())
//     ) {
//       throw new AppError(400, "Invalid check-in or check-out date");
//     }

//     // normalized date
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const normalizedCheckIn = new Date(data.checkInDate);
//     normalizedCheckIn.setHours(0, 0, 0, 0);

//     const normalizedCheckOut = new Date(data.checkOutDate);
//     normalizedCheckOut.setHours(0, 0, 0, 0);

//     // past date
//     if (normalizedCheckIn < today) {
//       throw new AppError(400, "Check-in date cannot be in the past");
//     }

//     if (normalizedCheckOut < today) {
//       throw new AppError(400, "Check-out date cannot be in the past");
//     }

//     // check-out before check-in
//     if (normalizedCheckOut <= normalizedCheckIn) {
//       throw new AppError(400, "Check-out date must be after check-in date");
//     }

//     // duration count
//     const oneDay = 1000 * 60 * 60 * 24;
//     const duration =
//       (normalizedCheckOut.getTime() - normalizedCheckIn.getTime()) / oneDay;

//     // minimal duration
//     if (duration < 1) {
//       throw new AppError(400, "Stay duration must be at least 1 night");
//     }

//     // ROOM QUANTITY
//     const roomQuantity = data.roomQuantity;

//     if (!Number.isInteger(roomQuantity)) {
//       throw new AppError(400, "Room quantity must be an integer");
//     }

//     if (roomQuantity < 1) {
//       throw new AppError(400, "Room quantity must be at least 1");
//     }

//     if (roomQuantity > roomType.totalRoom) {
//       throw new AppError(400, "Room quantity exceeds room capacity");
//     }

//     // RACE CONDITION
//     const orderItem = await prisma.$transaction(async (tx) => {
//       // CHECK AVAILABILITY
//       const bookedRooms = await tx.orderItem.aggregate({
//         where: {
//           roomTypeId: data.roomTypeId,
//           order: {
//             OR: [
//               {
//                 status: "PAID",
//               },
//               {
//                 status: "WAITING_PAYMENT",
//                 expiredAt: { gt: new Date() },
//               },
//             ],
//           },
//           AND: [
//             { checkInDate: { lt: normalizedCheckOut } },
//             { checkOutDate: { gt: normalizedCheckIn } },
//           ],
//         },
//         _sum: {
//           roomQuantity: true,
//         },
//       });

//       const totalBooked = bookedRooms._sum.roomQuantity ?? 0;

//       if (totalBooked + roomQuantity > roomType.totalRoom) {
//         throw new AppError(409, "Not enough rooms available");
//       }

//       // TOTAL AMOUNT
//       const totalAmount = duration * roomType.basePrice * roomQuantity;

//       // CREATE ORDER ITEM
//       return tx.orderItem.create({
//         data: {
//           ...data,
//           checkInDate: normalizedCheckIn,
//           checkOutDate: normalizedCheckOut,
//           totalAmount,
//         },
//       });
//     });

//     return orderItem;
//   }

// async getAllCustomerOrderItems(userId: string) {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//   });

//   if (!user) {
//     throw new AppError(404, "User not found");
//   }

//   const orderItem = await prisma.orderItem.findMany({
//     where: {
//       order: {
//         userId,
//       },
//     },
//     include: {
//       order: true,
//       roomType: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return orderItem;
// }
// }
