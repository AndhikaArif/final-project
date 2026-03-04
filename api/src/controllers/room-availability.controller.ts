import type { Request, Response, NextFunction } from "express";
import { RoomAvailabilityService } from "../services/room-availability.service.js";
import { AppError } from "../errors/app.error.js";
import type {
  SetAvailabilityRangeDTO,
  UpdateAvailabilitySingleDTO,
  RoomTypeParam,
  IdParam,
} from "../validations/property.validation.js";

const roomAvailabilityService = new RoomAvailabilityService();

export class RoomAvailabilityController {
  setRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const body = res.locals.body as SetAvailabilityRangeDTO;

      const result = await roomAvailabilityService.setAvailabilityRange(
        body.roomTypeId,
        authAccountId,
        body.startDate,
        body.endDate,
        body.isAvailable,
        body.note,
      );

      res.status(200).json({
        message: "Availability range updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  updateSingle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const body = res.locals.body as UpdateAvailabilitySingleDTO;

      const result = await roomAvailabilityService.updateSingleDate(
        body.roomTypeId,
        authAccountId,
        body.date,
        body.isAvailable,
        body.note,
      );

      res.status(200).json({
        message: "Availability updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getByRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as RoomTypeParam;

      const { startDate, endDate } = req.query;

      const parsedStart = startDate ? new Date(startDate as string) : undefined;
      const parsedEnd = endDate ? new Date(endDate as string) : undefined;

      if (
        (parsedStart && isNaN(parsedStart.getTime())) ||
        (parsedEnd && isNaN(parsedEnd.getTime()))
      ) {
        throw new AppError(400, "Invalid date query");
      }

      const data = await roomAvailabilityService.getAvailability(
        params.roomTypeId,
        authAccountId,
        parsedStart ? new Date(startDate as string) : undefined,
        parsedEnd ? new Date(endDate as string) : undefined,
      );

      res.status(200).json({
        message: "Availability fetched",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as IdParam;

      await roomAvailabilityService.deleteAvailability(
        params.id,
        authAccountId,
      );

      res.status(200).json({
        message: "Availability deleted",
      });
    } catch (err) {
      next(err);
    }
  };
}
