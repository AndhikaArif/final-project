import { Router } from "express";

import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { fileUpload } from "../middlewares/file-upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { RoomController } from "../controllers/room.controller.js";
import { PeakSeasonController } from "../controllers/peak-season.controller.js";
import { PropertyController } from "../controllers/property.controller.js";
import { CategoryController } from "../controllers/category.controller.js";

import { PropertySchema } from "../validations/property.validation.js";

const router = Router();

const propertyController = new PropertyController();
const roomController = new RoomController();
const peakSeasonController = new PeakSeasonController();
const categoryController = new CategoryController();

/* ================= PUBLIC ================= */

router.get("/properties/cities", propertyController.getCities);

router.get(
  "/properties/:id/calendar",
  validate(PropertySchema.idParam, "params"),
  propertyController.getPropertyCalendar,
);

router.get(
  "/properties",
  validate(PropertySchema.catalogQuery, "query"),
  propertyController.getPropertyCatalog,
);

router.get(
  "/properties/:id",
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.detailQuery, "query"),
  propertyController.getPropertyDetail,
);

/* ================= TENANT ================= */

router.use(
  AuthenticationMiddleware.verifyToken,
  AuthorizationMiddleware.allowRoles("TENANT"),
);

/* ===== CATEGORY ===== */

router.post(
  "/categories",
  validate(PropertySchema.createCategory, "body"),
  categoryController.createCategory,
);

router.put(
  "/categories/:id",
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.updateCategory, "body"),
  categoryController.updateCategory,
);

router.delete(
  "/categories/:id",
  validate(PropertySchema.idParam, "params"),
  categoryController.deleteCategory,
);

router.get("/categories", categoryController.getCategories);

/* ===== TENANT PROPERTY ===== */

router.get("/tenant/properties", propertyController.getTenantProperties);

router.post(
  "/tenant/properties",
  fileUpload().single("image"),
  validate(PropertySchema.createProperty, "body"),
  propertyController.createProperty,
);

router.put(
  "/tenant/properties/:id",
  fileUpload().single("image"),
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.updateProperty, "body"),
  propertyController.updateProperty,
);

router.delete(
  "/tenant/properties/:id",
  validate(PropertySchema.idParam, "params"),
  propertyController.deleteProperty,
);

/* ===== ROOM ===== */

router.post(
  "/properties/:propertyId/rooms",
  validate(PropertySchema.propertyIdParam, "params"),
  validate(PropertySchema.createRoom, "body"),
  roomController.createRoom,
);

router.put(
  "/rooms/:id",
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.updateRoom, "body"),
  roomController.updateRoom,
);

router.delete(
  "/rooms/:id",
  validate(PropertySchema.idParam, "params"),
  roomController.deleteRoom,
);

router.get(
  "/properties/:propertyId/rooms",
  validate(PropertySchema.propertyIdParam, "params"),
  roomController.getRoomsByProperty,
);

/* ===== PEAK SEASON ===== */

router.post(
  "/peak-season",
  validate(PropertySchema.createPeakSeason, "body"),
  peakSeasonController.createPeakSeason,
);

router.put(
  "/peak-season/:id",
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.updatePeakSeason, "body"),
  peakSeasonController.updatePeakSeason,
);

router.delete(
  "/peak-season/:id",
  validate(PropertySchema.idParam, "params"),
  peakSeasonController.deletePeakSeason,
);

export default router;
