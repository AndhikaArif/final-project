import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";

import { TenantResolverService } from "./tenant-resolver.service.js";
import type {
  CreateRoomDTO,
  UpdateRoomDTO,
} from "../validations/property.validation.js";

export class RoomService {
  async createRoom(
    propertyId: string,
    authAccountId: string,
    data: CreateRoomDTO,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const property = await prisma.property.findFirst({
      where: { id: propertyId, tenantId },
    });

    if (!property) {
      throw new AppError(
        403,
        "You are not allowed to add room to this property",
      );
    }

    const existing = await prisma.roomType.findFirst({
      where: {
        propertyId,
        name: data.name,
      },
    });

    if (existing) {
      throw new AppError(409, "Room name already exists in this property");
    }

    return prisma.roomType.create({
      data: {
        propertyId,
        name: data.name,
        basePrice: data.price,
        description: data.description,
        totalRoom: data.totalRoom,
      },
    });
  }

  async updateRoom(id: string, authAccountId: string, data: UpdateRoomDTO) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const room = await prisma.roomType.findFirst({
      where: {
        id,
        property: {
          tenantId,
        },
      },
    });

    if (!room) {
      throw new AppError(403, "You are not allowed to update this room");
    }

    return prisma.roomType.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { basePrice: data.price }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.totalRoom !== undefined && { totalRoom: data.totalRoom }),
      },
    });
  }

  async deleteRoom(id: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const room = await prisma.roomType.findFirst({
      where: {
        id,
        property: {
          tenantId,
        },
      },
    });

    if (!room) {
      throw new AppError(403, "You are not allowed to delete this room");
    }

    return prisma.roomType.delete({
      where: { id },
    });
  }

  async getRoomsByProperty(propertyId: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const property = await prisma.property.findFirst({
      where: { id: propertyId, tenantId },
    });

    if (!property) throw new AppError(403, "Not allowed");

    return prisma.roomType.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });
  }
}
