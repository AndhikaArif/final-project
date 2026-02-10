import type { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service.js";

const profileService = new ProfileService();

export class ProfileController {
  async myProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authAccountId = req.currentUser!.authAccountId;

      const profile = await profileService.myProfile(authAccountId);

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { authAccountId } = req.currentUser;
      const result = await profileService.updateProfile(
        authAccountId,
        req.body,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Image file is required",
        });
      }

      const { authAccountId } = req.currentUser;

      const result = await profileService.uploadProfileImage(
        authAccountId,
        req.file,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { authAccountId } = req.currentUser;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const result = await profileService.updateEmail(authAccountId, email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { authAccountId } = req.currentUser;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Old password and new password are required",
        });
      }

      const result = await profileService.changePassword(
        authAccountId,
        oldPassword,
        newPassword,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
