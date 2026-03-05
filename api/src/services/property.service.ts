import { prisma } from "../libs/prisma.lib.js";
import type { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app.error.js";
import { TenantResolverService } from "./tenant-resolver.service.js";
import type {
  CatalogQuery,
  DetailQuery,
  CreatePropertyDTO,
  UpdatePropertyDTO,
} from "../validations/property.validation.js";
import { FileUpload } from "../utils/file-upload.util.js";

const fileUploadService = new FileUpload();

export class PropertyService {
  async getPropertyCatalog(params: CatalogQuery) {
    const {
      city,
      checkIn,
      checkOut,
      search,
      category,
      sort = "name_asc",
      page = 1,
      limit = 10,
    } = params;

    if (checkIn) checkIn.setHours(0, 0, 0, 0);
    if (checkOut) checkOut.setHours(0, 0, 0, 0);

    if (checkIn && checkOut && checkIn >= checkOut) {
      throw new AppError(400, "checkOut must be after checkIn");
    }

    const where: Prisma.PropertyWhereInput = {
      isActive: true,
      roomTypes: {
        some: {
          totalRoom: { gt: 0 },
        },
      },
    };

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (category) {
      where.categoryId = category;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        category: true,
        roomTypes: {
          include: {
            peakSeasonRates: true,
          },
        },
      },
    });

    const results: {
      id: string;
      name: string;
      image: string | null;
      city: string;
      category: string;
      cheapestPrice: number;
    }[] = [];

    for (const property of properties) {
      let cheapestPrice: number | null = null;

      for (const room of property.roomTypes) {
        if (room.totalRoom <= 0) continue;

        // ======= TANPA TANGGAL → BASE PRICE =======
        if (!checkIn || !checkOut) {
          const base = room.basePrice;
          if (cheapestPrice === null || base < cheapestPrice) {
            cheapestPrice = base;
          }
          continue;
        }

        // ======= DENGAN TANGGAL → HITUNG RANGE =======
        let totalPrice = 0;
        let current = new Date(checkIn.getTime());

        while (current.getTime() < checkOut.getTime()) {
          let price = room.basePrice;

          const peak = room.peakSeasonRates.find((r) => {
            const start = new Date(r.startDate);
            const end = new Date(r.endDate);

            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            const compareDate = new Date(current);
            compareDate.setHours(0, 0, 0, 0);

            return compareDate >= start && compareDate <= end;
          });

          if (peak) {
            price +=
              peak.adjustmentType === "PERCENTAGE"
                ? (price * peak.value) / 100
                : peak.value;
          }

          totalPrice += price;
          current.setDate(current.getDate() + 1);
        }

        if (cheapestPrice === null || totalPrice < cheapestPrice) {
          cheapestPrice = totalPrice;
        }
      }

      if (cheapestPrice !== null) {
        results.push({
          id: property.id,
          name: property.name,
          image: property.image,
          city: property.city,
          category: property.category.name,
          cheapestPrice,
        });
      }
    }

    // ================= SORT =================
    if (sort === "price_asc")
      results.sort((a, b) => a.cheapestPrice - b.cheapestPrice);

    if (sort === "price_desc")
      results.sort((a, b) => b.cheapestPrice - a.cheapestPrice);

    if (sort === "name_desc")
      results.sort((a, b) => b.name.localeCompare(a.name));

    if (sort === "name_asc")
      results.sort((a, b) => a.name.localeCompare(b.name));

    // ================= PAGINATION =================
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getPropertyDetail(propertyId: string, query: DetailQuery) {
    const { checkIn, checkOut } = query;

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        isActive: true,
      },
      include: {
        category: true,
        roomTypes: {
          include: {
            peakSeasonRates: true,
          },
        },
        reviews: true,
      },
    });

    if (!property) throw new AppError(404, "Property not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = checkIn ?? today;
    const endDate = checkOut ?? new Date(today.getTime() + 86400000);

    if (startDate >= endDate) {
      throw new AppError(400, "checkOut must be after checkIn");
    }

    const rooms = [];

    for (const room of property.roomTypes) {
      const prices: Record<string, number> = {};

      let current = new Date(startDate.getTime());

      while (current.getTime() < endDate.getTime()) {
        let price = room.basePrice;

        const peak = room.peakSeasonRates.find((r) => {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);

          const compareDate = new Date(current);
          compareDate.setHours(0, 0, 0, 0);

          return compareDate >= start && compareDate <= end;
        });

        if (peak) {
          price +=
            peak.adjustmentType === "PERCENTAGE"
              ? (price * peak.value) / 100
              : peak.value;
        }

        const dateKey = current.toISOString().slice(0, 10);
        prices[dateKey] = price;

        current.setDate(current.getDate() + 1);
      }

      rooms.push({
        id: room.id,
        name: room.name,
        description: room.description,
        totalRoom: room.totalRoom,
        priceCalendar: prices,
        available: room.totalRoom > 0,
      });
    }

    return {
      id: property.id,
      name: property.name,
      description: property.description,
      image: property.image,
      address: property.address,
      city: property.city,
      category: property.category.name,
      rooms,
      reviews: property.reviews,
    };
  }

  async createProperty(
    authAccountId: string,
    data: CreatePropertyDTO,
    file?: Express.Multer.File,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const category = await prisma.propertyCategory.findFirst({
      where: {
        id: data.categoryId,
        tenantId,
      },
    });

    if (!category) {
      throw new AppError(403, "Invalid category for this tenant");
    }

    let imageUrl: string | undefined = undefined;

    if (file) {
      imageUrl = await fileUploadService.uploadSingle(file.path);
    }

    return prisma.property.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        categoryId: data.categoryId,
        maxGuest: data.maxGuest,
        ...(imageUrl && { image: imageUrl }),
      },
    });
  }

  async updateProperty(
    id: string,
    authAccountId: string,
    data: UpdatePropertyDTO,
    file?: Express.Multer.File,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const property = await prisma.property.findFirst({
      where: { id, tenantId },
    });

    if (!property) {
      throw new AppError(403, "You are not allowed to update this property");
    }

    if (data.categoryId) {
      const category = await prisma.propertyCategory.findFirst({
        where: { id: data.categoryId, tenantId },
      });

      if (!category) {
        throw new AppError(403, "Invalid category for this tenant");
      }
    }

    let imageUrl: string | undefined = undefined;

    if (file) {
      imageUrl = await fileUploadService.uploadSingle(file.path);
    }

    return prisma.property.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.maxGuest !== undefined && { maxGuest: data.maxGuest }),
        ...(imageUrl && { image: imageUrl }),
      },
    });
  }

  async deleteProperty(id: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const property = await prisma.property.findFirst({
      where: { id, tenantId },
    });

    if (!property) {
      throw new AppError(403, "You are not allowed to delete this property");
    }

    return prisma.property.delete({
      where: { id },
    });
  }

  async getTenantProperties(authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    return prisma.property.findMany({
      where: { tenantId },
      include: {
        category: true,
        roomTypes: {
          include: {
            peakSeasonRates: true,
          },
        },
      },
    });
  }

  async getCities() {
    const cities = await prisma.property.findMany({
      where: {
        isActive: true,
        roomTypes: {
          some: {
            totalRoom: { gt: 0 },
          },
        },
      },
      select: { city: true },
    });

    const normalized = cities.map((c) => c.city.trim().toLowerCase());
    const unique = [...new Set(normalized)];

    return unique.map((c) => c.charAt(0).toUpperCase() + c.slice(1));
  }

  async getPropertyCalendar(propertyId: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, isActive: true },
      include: {
        roomTypes: {
          include: {
            peakSeasonRates: true,
          },
        },
      },
    });

    if (!property) throw new AppError(404, "Property not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: {
      date: string;
      price: number;
      isPeak: boolean;
      available: boolean;
    }[] = [];

    for (let i = 0; i < 30; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() + i);

      let cheapest: number | null = null;
      let isPeak = false;

      for (const room of property.roomTypes) {
        let price = room.basePrice;

        const peak = room.peakSeasonRates.find((r) => {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);

          const compareDate = new Date(current);
          compareDate.setHours(0, 0, 0, 0);

          return compareDate >= start && compareDate <= end;
        });

        if (peak) {
          isPeak = true;
          price +=
            peak.adjustmentType === "PERCENTAGE"
              ? (price * peak.value) / 100
              : peak.value;
        }

        if (cheapest === null || price < cheapest) {
          cheapest = price;
        }
      }

      if (cheapest !== null) {
        days.push({
          date: current.toISOString().slice(0, 10),
          price: cheapest,
          isPeak,
          available: property.roomTypes.some((r) => r.totalRoom > 0),
        });
      }
    }

    return days;
  }
}
