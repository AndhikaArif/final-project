import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { TenantResolverService } from "./tenant-resolver.service.js";
import { normalizeDate } from "../utils/date.util.js";
import { validateRoomOwnership } from "../utils/room-ownership.util.js";

export class PeakSeasonService {
  async createPeakSeason(
    roomTypeId: string,
    authAccountId: string,
    startDate: Date,
    endDate: Date,
    adjustmentType: "PERCENTAGE" | "NOMINAL",
    value: number,
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
      throw new AppError(400, "Peak season max range is 365 days");
    }

    if (value < 0) {
      throw new AppError(400, "Value must be positive");
    }

    if (adjustmentType === "PERCENTAGE" && value > 1000) {
      throw new AppError(400, "Percentage too large");
    }

    const overlap = await prisma.peakSeasonRate.findFirst({
      where: {
        roomTypeId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlap) {
      throw new AppError(400, "Peak season date overlaps with existing one");
    }

    return prisma.peakSeasonRate.create({
      data: {
        roomTypeId,
        startDate: start,
        endDate: end,
        adjustmentType,
        value,
      },
    });
  }

  async updatePeakSeason(
    id: string,
    authAccountId: string,
    startDate: Date,
    endDate: Date,
    adjustmentType: "PERCENTAGE" | "NOMINAL",
    value: number,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const existing = await prisma.peakSeasonRate.findFirst({
      where: {
        id,
        roomType: {
          property: { tenantId },
        },
      },
    });

    if (!existing) {
      throw new AppError(403, "Not allowed");
    }

    if (value < 0) {
      throw new AppError(400, "Value must be positive");
    }

    if (adjustmentType === "PERCENTAGE" && value > 1000) {
      throw new AppError(400, "Percentage too large");
    }

    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    if (start > end) {
      throw new AppError(400, "startDate must be before endDate");
    }

    const diffDays =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    if (diffDays > 365) {
      throw new AppError(400, "Peak season max range is 365 days");
    }

    const overlap = await prisma.peakSeasonRate.findFirst({
      where: {
        roomTypeId: existing.roomTypeId,
        id: { not: id },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlap) {
      throw new AppError(400, "Peak season date overlaps with existing one");
    }

    return prisma.peakSeasonRate.update({
      where: { id },
      data: {
        startDate: start,
        endDate: end,
        adjustmentType,
        value,
      },
    });
  }

  async deletePeakSeason(id: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const existing = await prisma.peakSeasonRate.findFirst({
      where: {
        id,
        roomType: {
          property: { tenantId },
        },
      },
    });

    if (!existing) {
      throw new AppError(403, "Not allowed");
    }

    return prisma.peakSeasonRate.delete({
      where: { id },
    });
  }

  async getByRoomPeakSeason(roomTypeId: string, authAccountId: string) {
    await validateRoomOwnership(roomTypeId, authAccountId);

    return prisma.peakSeasonRate.findMany({
      where: { roomTypeId },
      orderBy: { startDate: "asc" },
    });
  }
}
