import type { Request, Response, NextFunction } from "express";
import { PeakSeasonService } from "../services/peak-season.service.js";

const peakSeasonService = new PeakSeasonService();

export class PeakSeasonController {
  async createPeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser!.authAccountId;
      const body = res.locals.body;
      const roomTypeId = body.roomTypeId;

      const result = await peakSeasonService.createPeakSeason(
        roomTypeId,
        tenantId,
        body,
      );

      res.status(201).json({
        message: "Peak season created successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser!.authAccountId;
      const params = res.locals.params;
      const body = res.locals.body;

      const result = await peakSeasonService.updatePeakSeason(
        params.id,
        tenantId,
        body,
      );

      res.status(200).json({
        message: "Peak season updated successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePeakSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.currentUser!.authAccountId;
      const params = res.locals.params;

      await peakSeasonService.deletePeakSeason(params.id, tenantId);

      res.status(200).json({
        message: "Peak season deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
