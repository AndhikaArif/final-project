import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma.config.js";

export class OwnershipMiddleware {
  static async ownsProperty(req: Request, res: Response, next: NextFunction) {
    const propertyId = req.params.id;
    const tenantId = req.currentUser?.id;

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenant: {
          authAccountId: tenantId,
        },
      },
    });

    if (!property) {
      return res.status(403).json({
        message: "You do not own this property",
      });
    }

    next();
  }

  static async ownsRoom(req: Request, res: Response, next: NextFunction) {
    const roomId = req.params.id;
    const authAccountId = req.currentUser?.id;

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        property: {
          tenant: {
            authAccountId,
          },
        },
      },
    });

    if (!room) {
      return res.status(403).json({
        message: "You do not own this room",
      });
    }

    next();
  }
}
