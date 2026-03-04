import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { TenantResolverService } from "../services/tenant-resolver.service.js";

export async function validateRoomOwnership(
  roomTypeId: string,
  authAccountId: string,
) {
  const tenantId = await TenantResolverService.getTenantId(authAccountId);

  const room = await prisma.roomType.findFirst({
    where: {
      id: roomTypeId,
      property: { tenantId },
    },
  });

  if (!room) {
    throw new AppError(403, "You are not allowed to manage this room");
  }

  return room;
}
