import type { Request, Response, NextFunction } from "express";
import { PropertyService } from "../services/property.service.js";
import type {
  CatalogQuery,
  DetailQuery,
  CreatePropertyDTO,
  UpdatePropertyDTO,
  IdParam,
} from "../validations/property.validation.js";

const propertyService = new PropertyService();

export class PropertyController {
  async getPropertyCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const query = res.locals.query as CatalogQuery; // ambil dari locals
      const result = await propertyService.getPropertyCatalog(query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPropertyDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const params = res.locals.params as IdParam;
      const query = res.locals.query as DetailQuery;

      const result = await propertyService.getPropertyDetail(params.id, query);
      res.status(200).json({
        message: "Property detail fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const body = res.locals.body as CreatePropertyDTO;
      const result = await propertyService.createProperty(authAccountId, body);

      res.status(201).json({
        message: "Property created successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as IdParam;
      const body = res.locals.body as UpdatePropertyDTO;

      const result = await propertyService.updateProperty(
        params.id,
        authAccountId,
        body,
      );

      res.status(200).json({
        message: "Property updated successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params as IdParam;

      await propertyService.deleteProperty(params.id, authAccountId);

      res.status(200).json({ message: "Property deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
