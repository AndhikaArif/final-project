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

  static roomTypeParam = z.object({
    roomTypeId: z.string().uuid(),
  });

  /* -------------------------------------------------------------------------- */
  /*                           PROPERTY QUERY SCHEMAS                           */
  /* -------------------------------------------------------------------------- */

  static catalogQuery = z
    .object({
      city: z.string().trim().toLowerCase().min(1).optional(),

      checkIn: z.coerce.date().optional(),
      checkOut: z.coerce.date().optional(),

      search: z.string().trim().min(1).optional(),
      category: z.string().optional(),

      sort: z
        .enum(["price_asc", "price_desc", "name_asc", "name_desc"])
        .optional(),

      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
    })
    .refine(
      (data) => {
        if (!data.checkIn || !data.checkOut) return true;
        return data.checkOut > data.checkIn;
      },
      {
        message: "checkOut must be after checkIn",
        path: ["checkOut"],
      },
    );

  static detailQuery = z
    .object({
      checkIn: z.coerce.date().optional(),
      checkOut: z.coerce.date().optional(),
    })
    .refine(
      (data) => {
        if (!data.checkIn || !data.checkOut) return true;
        return data.checkOut > data.checkIn;
      },
      {
        message: "checkOut must be after checkIn",
        path: ["checkOut"],
      },
    );

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
    city: z.string().min(1).trim().toLowerCase(),
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
  /*                        ROOM AVAILABILITY SCHEMAS                           */
  /* -------------------------------------------------------------------------- */

  static setAvailabilityRange = z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      isAvailable: z.boolean(),
      note: z.string().optional(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: "endDate must be after startDate",
      path: ["endDate"],
    });

  static updateAvailabilitySingle = z.object({
    date: z.coerce.date(),
    isAvailable: z.boolean(),
    note: z.string().optional(),
  });

  /* -------------------------------------------------------------------------- */
  /*                             PEAK SEASON SCHEMAS                            */
  /* -------------------------------------------------------------------------- */

  static peakSeasonParam = z.object({
    roomTypeId: z.string().uuid(),
    id: z.string().uuid(),
  });

  static createPeakSeason = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    adjustmentType: z.enum(["PERCENTAGE", "NOMINAL"]),
    value: z.coerce.number().min(0),
  });

  static updatePeakSeason = PropertySchema.createPeakSeason;
}

/* -------------------------------------------------------------------------- */
/*                               INFERRED TYPES                               */
/* -------------------------------------------------------------------------- */

export type IdParam = z.infer<typeof PropertySchema.idParam>;
export type PropertyIdParam = z.infer<typeof PropertySchema.propertyIdParam>;
export type RoomTypeParam = z.infer<typeof PropertySchema.roomTypeParam>;

export type CatalogQuery = z.infer<typeof PropertySchema.catalogQuery>;
export type DetailQuery = z.infer<typeof PropertySchema.detailQuery>;

export type CreateCategoryDTO = z.infer<typeof PropertySchema.createCategory>;
export type UpdateCategoryDTO = z.infer<typeof PropertySchema.updateCategory>;

export type CreatePropertyDTO = z.infer<typeof PropertySchema.createProperty>;
export type UpdatePropertyDTO = z.infer<typeof PropertySchema.updateProperty>;

export type CreateRoomDTO = z.infer<typeof PropertySchema.createRoom>;
export type UpdateRoomDTO = z.infer<typeof PropertySchema.updateRoom>;

export type SetAvailabilityRangeDTO = z.infer<
  typeof PropertySchema.setAvailabilityRange
>;
export type UpdateAvailabilitySingleDTO = z.infer<
  typeof PropertySchema.updateAvailabilitySingle
>;

export type CreatePeakSeasonDTO = z.infer<
  typeof PropertySchema.createPeakSeason
>;
export type UpdatePeakSeasonDTO = z.infer<
  typeof PropertySchema.updatePeakSeason
>;
