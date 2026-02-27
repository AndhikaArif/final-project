import { z } from "zod";

export class PropertySchema {
  /* -------------------------------------------------------------------------- */
  /*                                PARAMS SCHEMA                               */
  /* -------------------------------------------------------------------------- */

  static idParam = z.object({
    id: z.string().uuid(),
  });

  static propertyIdParam = z.object({
    propertyId: z.string().uuid(),
  });

  /* -------------------------------------------------------------------------- */
  /*                           PROPERTY QUERY SCHEMAS                           */
  /* -------------------------------------------------------------------------- */

  static catalogQuery = z.object({
    city: z.string().min(1, "City is required"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),

    search: z.string().optional(),
    category: z.string().optional(),
    sort: z
      .enum(["price_asc", "price_desc", "name_asc", "name_desc"])
      .optional(),

    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  });

  static detailQuery = z.object({
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  });

  /* -------------------------------------------------------------------------- */
  /*                              CATEGORY SCHEMAS                              */
  /* -------------------------------------------------------------------------- */

  static createCategory = z.object({
    name: z.string().min(1).max(100),
  });

  static updateCategory = PropertySchema.createCategory.partial();

  /* -------------------------------------------------------------------------- */
  /*                              PROPERTY SCHEMAS                              */
  /* -------------------------------------------------------------------------- */

  static createProperty = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    categoryId: z.string().uuid(),
    maxGuest: z.coerce.number().min(1),
  });

  static updateProperty = PropertySchema.createProperty.partial();

  /* -------------------------------------------------------------------------- */
  /*                                ROOM SCHEMAS                                */
  /* -------------------------------------------------------------------------- */

  static createRoom = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(0),
    description: z.string().min(1),
    totalRoom: z.coerce.number().min(1),
  });

  static updateRoom = PropertySchema.createRoom.partial();

  /* -------------------------------------------------------------------------- */
  /*                             PEAK SEASON SCHEMAS                            */
  /* -------------------------------------------------------------------------- */

  static createPeakSeason = z.object({
    roomTypeId: z.string().uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    adjustmentType: z.enum(["PERCENTAGE", "NOMINAL"]),
    value: z.coerce.number().min(0),
  });

  static updatePeakSeason = PropertySchema.createPeakSeason.partial();
}

/* -------------------------------------------------------------------------- */
/*                               INFERRED TYPES                               */
/* -------------------------------------------------------------------------- */

export type CatalogQuery = z.infer<typeof PropertySchema.catalogQuery>;
export type DetailQuery = z.infer<typeof PropertySchema.detailQuery>;

export type CreateCategoryDTO = z.infer<typeof PropertySchema.createCategory>;
export type UpdateCategoryDTO = z.infer<typeof PropertySchema.updateCategory>;

export type IdParam = z.infer<typeof PropertySchema.idParam>;

export type CreatePropertyDTO = z.infer<typeof PropertySchema.createProperty>;
export type UpdatePropertyDTO = z.infer<typeof PropertySchema.updateProperty>;

export type CreateRoomDTO = z.infer<typeof PropertySchema.createRoom>;
export type UpdateRoomDTO = z.infer<typeof PropertySchema.updateRoom>;

export type CreatePeakSeasonDTO = z.infer<
  typeof PropertySchema.createPeakSeason
>;
export type UpdatePeakSeasonDTO = z.infer<
  typeof PropertySchema.updatePeakSeason
>;
