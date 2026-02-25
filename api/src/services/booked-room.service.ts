import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import {
  type IRoomAvailability,
  type IIsRoomAvailable,
} from "../types/booked-room.js";

export class BookedRoomService {
  // CHECK ROOM AVAILABILITY
  async roomAvailability(data: IRoomAvailability): Promise<number> {
    const rooms = await prisma.room.findMany({
      where: { typeId: data.roomTypeId },
      select: { id: true },
    });

    if (!rooms.length) return 0;

    const bookedRooms = await prisma.bookedRooms.findMany({
      where: {
        roomId: { in: rooms.map((r) => r.id) },
        AND: [
          { checkInDate: { lt: data.checkOutDate } },
          { checkOutDate: { gt: data.checkInDate } },
        ],
      },
      select: { roomId: true },
    });

    const bookedRoomsIds = new Set(bookedRooms.map((b) => b.roomId));

    const availableCount = rooms.filter(
      (room) => !bookedRoomsIds.has(room.id),
    ).length;

    return availableCount;
  }

  // CHECK ONE ROOM AVAILABILITY
  async isRoomAvailable(data: IIsRoomAvailable): Promise<boolean> {
    const conflict = await prisma.bookedRooms.findFirst({
      where: {
        roomId: data.roomId,
        AND: [
          { checkInDate: { lt: data.checkOutDate } },
          { checkOutDate: { gt: data.checkInDate } },
        ],
      },
    });

    return !conflict;
  }

  //   ASSIGN ROOMS
  async assignRoomsForOrderItem(orderItemId: string) {
    return prisma.$transaction(async (tx) => {
      const orderItem = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
          roomType: {
            include: { rooms: true },
          },
        },
      });

      if (!orderItem) {
        throw new AppError(404, "Order item not found");
      }

      const { checkInDate, checkOutDate, roomQuantity } = orderItem;

      const availableRooms: { id: string }[] = [];

      for (const room of orderItem.roomType.rooms) {
        const conflict = await tx.bookedRooms.findFirst({
          where: {
            roomId: room.id,
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
        });

        if (!conflict) {
          availableRooms.push({ id: room.id });
        }

        if (availableRooms.length === roomQuantity) break;
      }

      if (availableRooms.length < roomQuantity) {
        throw new AppError(400, "Not enough available rooms");
      }

      await tx.bookedRooms.createMany({
        data: availableRooms.map((room) => ({
          orderItemId,
          roomId: room.id,
          checkInDate,
          checkOutDate,
        })),
      });

      return true;
    });
  }

  //    RELEASE BOOKED ROOMS
  async releaseBookedRoomsByOrder(orderId: string) {
    await prisma.bookedRooms.deleteMany({
      where: {
        orderItem: {
          orderId: orderId,
        },
      },
    });
  }

  //   GET BOOKED ROOMS BY DATE
  async getBookedRoomsByDate(roomTypeId: string, date: Date) {
    const rooms = await prisma.room.findMany({
      where: { typeId: roomTypeId },
      select: { id: true, roomNumber: true },
    });

    const booked = await prisma.bookedRooms.findMany({
      where: {
        roomId: { in: rooms.map((r) => r.id) },
        checkInDate: { lte: date },
        checkOutDate: { gt: date },
      },
      include: {
        room: true,
      },
    });

    return booked;
  }
}
