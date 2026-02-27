import type { Request, Response, NextFunction } from "express";
import { PropertyService } from "../services/property.service.js";
import { AppError } from "../errors/app.error.js";
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
      const query = res.locals.query as CatalogQuery;
      const result = await propertyService.getPropertyCatalog(query);

      res.status(200).json({
        message: "Property catalog fetched successfully",
        ...result,
      });
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
      if (!req.currentUser) throw new AppError(401, "Unauthorized");

      const body = res.locals.body as CreatePropertyDTO;

      const result = await propertyService.createProperty(
        req.currentUser.authAccountId,
        body,
        req.file,
      );

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
      if (!req.currentUser) throw new AppError(401, "Unauthorized");

      const params = res.locals.params as IdParam;
      const body = res.locals.body as UpdatePropertyDTO;

      const result = await propertyService.updateProperty(
        params.id,
        req.currentUser.authAccountId,
        body,
        req.file,
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
      if (!req.currentUser) throw new AppError(401, "Unauthorized");

      const params = res.locals.params as IdParam;

      await propertyService.deleteProperty(
        params.id,
        req.currentUser.authAccountId,
      );

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getTenantProperties(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.currentUser) throw new AppError(401, "Unauthorized");

      const result = await propertyService.getTenantProperties(
        req.currentUser.authAccountId,
      );

      res.status(200).json({
        message: "Tenant properties fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const cities = await propertyService.getCities();

      res.status(200).json({
        message: "Cities fetched successfully",
        data: cities,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPropertyCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const params = res.locals.params as IdParam;

      const result = await propertyService.getPropertyCalendar(params.id);

      res.status(200).json({
        message: "Property calendar fetched successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
