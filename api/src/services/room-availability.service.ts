import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { TenantResolverService } from "./tenant-resolver.service.js";
import { normalizeDate } from "../utils/date.util.js";
import { validateRoomOwnership } from "../utils/room-ownership.util.js";

export class RoomAvailabilityService {
  async setAvailabilityRange(
    roomTypeId: string,
    authAccountId: string,
    startDate: Date,
    endDate: Date,
    isAvailable: boolean,
    note?: string,
  ) {
    await validateRoomOwnership(roomTypeId, authAccountId);

    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    if (start > end) {
      throw new AppError(400, "startDate must be before endDate");
    }

    const diffDays =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    if (diffDays > 365) {
      throw new AppError(400, "Range too large (max 365 days)");
    }

    const dates: Date[] = [];
    const current = new Date(start);

    while (current.getTime() <= end.getTime()) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    const queries = dates.map((date) =>
      prisma.roomAvailability.upsert({
        where: {
          roomTypeId_date: {
            roomTypeId,
            date,
          },
        },
        update: {
          isAvailable,
          ...(note !== undefined && { note }),
        },
        create: {
          roomTypeId,
          date,
          isAvailable,
          ...(note !== undefined && { note }),
        },
      }),
    );

    await prisma.$transaction(queries);

    return {
      message: "Room availability updated",
      daysUpdated: dates.length,
    };
  }

  async updateSingleDate(
    roomTypeId: string,
    authAccountId: string,
    date: Date,
    isAvailable: boolean,
    note?: string,
  ) {
    await validateRoomOwnership(roomTypeId, authAccountId);

    const normalized = normalizeDate(date);

    return prisma.roomAvailability.upsert({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date: normalized,
        },
      },
      update: {
        isAvailable,
        ...(note !== undefined && { note }),
      },
      create: {
        roomTypeId,
        date: normalized,
        isAvailable,
        ...(note !== undefined && { note }),
      },
    });
  }

  async getAvailability(
    roomTypeId: string,
    authAccountId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    await validateRoomOwnership(roomTypeId, authAccountId);

    const where: {
      roomTypeId: string;
      date?: { gte: Date; lte: Date };
    } = { roomTypeId };

    if (startDate && endDate) {
      where.date = {
        gte: normalizeDate(startDate),
        lte: normalizeDate(endDate),
      };
    }

    return prisma.roomAvailability.findMany({
      where,
      orderBy: { date: "asc" },
    });
  }

  async deleteAvailability(id: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const record = await prisma.roomAvailability.findFirst({
      where: {
        id,
        roomType: {
          property: {
            tenantId,
          },
        },
      },
    });

    if (!record) {
      throw new AppError(403, "Not allowed");
    }

    return prisma.roomAvailability.delete({
      where: { id },
    });
  }
}
