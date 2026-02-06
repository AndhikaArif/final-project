import type { Request, Response, NextFunction } from "express";
import { prisma } from "../libs/prisma.lib.js";

export class OwnershipMiddleware {
  static async ownsProperty(req: Request, res: Response, next: NextFunction) {
    const propertyId = req.params.id;
    const authAccountId = req.currentUser?.id;

    if (!propertyId || typeof propertyId !== "string") {
      return res.status(400).json({
        message: "Invalid property id",
      });
    }

    if (!authAccountId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenant: {
          authAccountId: authAccountId,
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

    if (!roomId || typeof roomId !== "string") {
      return res.status(400).json({
        message: "Invalid room id",
      });
    }

    if (!authAccountId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
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
