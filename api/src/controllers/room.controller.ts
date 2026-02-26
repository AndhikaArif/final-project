import type { Request, Response, NextFunction } from "express";
import { RoomService } from "../services/room.service.js";

const roomService = new RoomService();

export class RoomController {
  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser!.authAccountId;
      const params = res.locals.params;
      const body = res.locals.body;

      const result = await roomService.createRoom(
        params.propertyId,
        tenantId,
        body,
      );

      res.status(201).json({
        message: "Room created successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser!.authAccountId;
      const params = res.locals.params;
      const body = res.locals.body;

      const result = await roomService.updateRoom(params.id, tenantId, body);

      res.status(200).json({
        message: "Room updated successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser!.authAccountId;
      const params = res.locals.params;

      await roomService.deleteRoom(params.id, tenantId);

      res.status(200).json({
        message: "Room deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
