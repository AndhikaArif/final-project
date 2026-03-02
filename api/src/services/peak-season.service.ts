import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { TenantResolverService } from "./tenant-resolver.service.js";
import { AdjustmentType } from "../generated/prisma/client.js";
import type {
  CreatePeakSeasonDTO,
  UpdatePeakSeasonDTO,
} from "../validations/property.validation.js";

export class PeakSeasonService {
  async createPeakSeason(
    roomTypeId: string,
    authAccountId: string,
    data: CreatePeakSeasonDTO,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const room = await prisma.roomType.findFirst({
      where: {
        id: roomTypeId,
        property: {
          tenantId,
        },
      },
    });

    if (!room) {
      throw new AppError(403, "You are not allowed to add peak season here");
    }

    if (data.adjustmentType === "PERCENTAGE" && data.value > 100) {
      throw new AppError(400, "Percentage cannot exceed 100%");
    }

    if (data.value < 0) {
      throw new AppError(400, "Value cannot be negative");
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new AppError(400, "End date must be after start date");
    }

    // 🔥 OVERLAP CHECK
    const overlapping = await prisma.peakSeasonRate.findFirst({
      where: {
        roomTypeId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      throw new AppError(
        400,
        "Peak season date range overlaps with existing one",
      );
    }

    return prisma.peakSeasonRate.create({
      data: {
        roomTypeId,
        startDate,
        endDate,
        adjustmentType: data.adjustmentType as AdjustmentType,
        value: data.value,
      },
    });
  }

  async updatePeakSeason(
    id: string,
    authAccountId: string,
    data: UpdatePeakSeasonDTO,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const peak = await prisma.peakSeasonRate.findFirst({
      where: {
        id,
        roomType: {
          property: {
            tenantId,
          },
        },
      },
    });

    if (!peak) {
      throw new AppError(403, "You are not allowed to update this peak season");
    }

    const startDate = data.startDate
      ? new Date(data.startDate)
      : peak.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : peak.endDate;

    if (startDate >= endDate) {
      throw new AppError(400, "End date must be after start date");
    }

    if (
      data.adjustmentType === "PERCENTAGE" &&
      data.value !== undefined &&
      data.value > 100
    ) {
      throw new AppError(400, "Percentage cannot exceed 100%");
    }

    if (data.value !== undefined && data.value < 0) {
      throw new AppError(400, "Value cannot be negative");
    }

    // 🔥 OVERLAP CHECK (exclude dirinya sendiri)
    const overlapping = await prisma.peakSeasonRate.findFirst({
      where: {
        roomTypeId: peak.roomTypeId,
        id: { not: id },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      throw new AppError(
        400,
        "Peak season date range overlaps with existing one",
      );
    }

    return prisma.peakSeasonRate.update({
      where: { id },
      data: {
        startDate,
        endDate,
        ...(data.adjustmentType !== undefined && {
          adjustmentType: data.adjustmentType as AdjustmentType,
        }),
        ...(data.value !== undefined && { value: data.value }),
      },
    });
  }

  async deletePeakSeason(id: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const peak = await prisma.peakSeasonRate.findFirst({
      where: {
        id,
        roomType: {
          property: {
            tenantId,
          },
        },
      },
    });

    if (!peak) {
      throw new AppError(403, "You are not allowed to delete this peak season");
    }

    return prisma.peakSeasonRate.delete({
      where: { id },
    });
  }
}
