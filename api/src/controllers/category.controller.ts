import type { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service.js";

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const body = res.locals.body; // validated body

      const result = await categoryService.createCategory(authAccountId, body);

      res.status(201).json({
        message: "Category created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params;
      const body = res.locals.body;

      const result = await categoryService.updateCategory(
        params.id,
        authAccountId,
        body,
      );

      res.json({
        message: "Category updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;
      const params = res.locals.params;

      await categoryService.deleteCategory(params.id, authAccountId);

      res.json({
        message: "Category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
