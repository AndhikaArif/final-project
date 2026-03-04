import type { Request, Response, NextFunction } from "express";
import { PeakSeasonService } from "../services/peak-season.service.js";
import type {
  CreatePeakSeasonDTO,
  UpdatePeakSeasonDTO,
  IdParam,
  RoomTypeParam,
} from "../validations/property.validation.js";

const peakSeasonService = new PeakSeasonService();

export class PeakSeasonController {
  async createPeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const body = res.locals.body as CreatePeakSeasonDTO;
      const params = res.locals.params as RoomTypeParam;

      const data = await peakSeasonService.createPeakSeason(
        params.roomTypeId, // ambil dari params
        authAccountId,
        body.startDate,
        body.endDate,
        body.adjustmentType,
        body.value,
      );

      res.status(201).json({
        message: "Peak season created",
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const body = res.locals.body as UpdatePeakSeasonDTO;
      const params = res.locals.params as IdParam;

      const data = await peakSeasonService.updatePeakSeason(
        params.id,
        authAccountId,
        body.startDate!,
        body.endDate!,
        body.adjustmentType!,
        body.value!,
      );

      res.status(200).json({
        message: "Peak season updated",
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as IdParam;

      await peakSeasonService.deletePeakSeason(params.id, authAccountId);

      res.status(200).json({
        message: "Peak season deleted",
      });
    } catch (err) {
      next(err);
    }
  }

  async getByRoomPeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as RoomTypeParam;

      const data = await peakSeasonService.getByRoomPeakSeason(
        params.roomTypeId,
        authAccountId,
      );

      res.status(200).json({
        message: "Peak season fetched",
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
