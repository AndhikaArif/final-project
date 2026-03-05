import type { Request, Response, NextFunction } from "express";
import { RoomService } from "../services/room.service.js";
import type { PropertyIdParam } from "../validations/property.validation.js";
import type {
  CreateRoomDTO,
  UpdateRoomDTO,
  IdParam,
} from "../validations/property.validation.js";

const roomService = new RoomService();

export class RoomController {
  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as PropertyIdParam;
      const body = res.locals.body as CreateRoomDTO;

      const result = await roomService.createRoom(
        params.propertyId,
        authAccountId,
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
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as IdParam;
      const body = res.locals.body as UpdateRoomDTO;

      const result = await roomService.updateRoom(
        params.id,
        authAccountId,
        body,
      );

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
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as IdParam;

      await roomService.deleteRoom(params.id, authAccountId);

      res.status(200).json({
        message: "Room deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async getRoomsByProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as PropertyIdParam;

      const result = await roomService.getRoomsByProperty(
        params.propertyId,
        authAccountId,
      );

      res.status(200).json({
        message: "Rooms fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
