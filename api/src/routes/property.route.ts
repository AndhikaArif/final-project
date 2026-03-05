import { Router } from "express";

import { AuthenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { fileUpload } from "../middlewares/file-upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import { RoomController } from "../controllers/room.controller.js";
import { PeakSeasonController } from "../controllers/peak-season.controller.js";
import { PropertyController } from "../controllers/property.controller.js";
import { CategoryController } from "../controllers/category.controller.js";
import { RoomAvailabilityController } from "../controllers/room-availability.controller.js";

import { PropertySchema } from "../validations/property.validation.js";

const router = Router();

const propertyController = new PropertyController();
const roomController = new RoomController();
const peakSeasonController = new PeakSeasonController();
const categoryController = new CategoryController();
const roomAvailabilityController = new RoomAvailabilityController();

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

router.get(
  "/property/rooms/:id",
  validate(PropertySchema.idParam, "params"),
  roomController.getRoomById,
);

/* ================= TENANT ================= */

router.use(
  AuthenticationMiddleware.verifyToken,
  AuthorizationMiddleware.allowRoles("TENANT"),
);

/* ===== CATEGORY ===== */

router.post(
  "/tenant/categories",
  validate(PropertySchema.createCategory, "body"),
  categoryController.createCategory,
);

router.put(
  "/tenant/categories/:id",
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.updateCategory, "body"),
  categoryController.updateCategory,
);

router.delete(
  "/tenant/categories/:id",
  validate(PropertySchema.idParam, "params"),
  categoryController.deleteCategory,
);

router.get("/tenant/categories", categoryController.getCategories);

/* ===== PROPERTY ===== */

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
  "/tenant/properties/:propertyId/rooms",
  validate(PropertySchema.propertyIdParam, "params"),
  validate(PropertySchema.createRoom, "body"),
  roomController.createRoom,
);

router.get(
  "/tenant/properties/:propertyId/rooms",
  validate(PropertySchema.propertyIdParam, "params"),
  roomController.getRoomsByProperty,
);

router.put(
  "/tenant/rooms/:id",
  validate(PropertySchema.idParam, "params"),
  validate(PropertySchema.updateRoom, "body"),
  roomController.updateRoom,
);

router.delete(
  "/tenant/rooms/:id",
  validate(PropertySchema.idParam, "params"),
  roomController.deleteRoom,
);

/* ===== ROOM AVAILABILITY ===== */

router.put(
  "/tenant/rooms/:roomTypeId/availability/range",
  validate(PropertySchema.setAvailabilityRange, "body"),
  roomAvailabilityController.setRange,
);

router.put(
  "/tenant/rooms/:roomTypeId/availability/single",
  validate(PropertySchema.updateAvailabilitySingle, "body"),
  roomAvailabilityController.updateSingle,
);

router.get(
  "/tenant/rooms/:roomTypeId/availability",
  validate(PropertySchema.roomTypeParam, "params"),
  roomAvailabilityController.getByRoom,
);

router.delete(
  "/tenant/rooms/availability/:id",
  validate(PropertySchema.idParam, "params"),
  roomAvailabilityController.delete,
);

/* ===== PEAK SEASON ===== */

router.get(
  "/tenant/rooms/:roomTypeId/peak-season",
  validate(PropertySchema.roomTypeParam, "params"),
  peakSeasonController.getByRoomPeakSeason,
);

router.post(
  "/tenant/rooms/:roomTypeId/peak-season",
  validate(PropertySchema.roomTypeParam, "params"),
  validate(PropertySchema.createPeakSeason, "body"),
  peakSeasonController.createPeakSeason,
);

router.put(
  "/tenant/rooms/:roomTypeId/peak-season/:id",
  validate(PropertySchema.peakSeasonParam, "params"),
  validate(PropertySchema.updatePeakSeason, "body"),
  peakSeasonController.updatePeakSeason,
);

router.delete(
  "/tenant/rooms/:roomTypeId/peak-season/:id",
  validate(PropertySchema.roomTypeParam, "params"),
  validate(PropertySchema.idParam, "params"),
  peakSeasonController.deletePeakSeason,
);

export default router;
