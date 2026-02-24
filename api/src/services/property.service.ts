import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";

export class roomService {
  async getPropertyCatalog(params: {
    city: string;
    checkIn: Date;
    checkOut: Date;
    search?: string;
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
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

    const skip = (page - 1) * limit;

    const where: any = {
      city: { contains: city, mode: "insensitive" },
      isActive: true,
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (category) {
      where.categoryId = category;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        roomTypes: {
          include: {
            peakSeasonRates: {
              where: {
                startDate: { lte: checkOut },
                endDate: { gte: checkIn },
              },
            },
          },
        },
      },
      skip,
      take: limit,
    });

    const result = [];

    for (const property of properties) {
      let cheapestPrice: number | null = null;

      for (const room of property.roomTypes) {
        // 1️⃣ Availability Check
        const booked = await prisma.orderItem.aggregate({
          _sum: { roomQuantity: true },
          where: {
            roomTypeId: room.id,
            order: {
              status: { in: ["WAITING_PAYMENT", "PAID"] },
            },
            checkInDate: { lt: checkOut },
            checkOutDate: { gt: checkIn },
          },
        });

        const bookedQty = booked._sum.roomQuantity ?? 0;
        const available = room.totalRoom - bookedQty;

        if (available <= 0) continue;

        // 2️⃣ Price Calculation
        let total = 0;
        let current = new Date(checkIn);

        while (current < checkOut) {
          let dailyPrice = room.basePrice;

          const peak = room.peakSeasonRates.find(
            (rate) => current >= rate.startDate && current <= rate.endDate,
          );

          if (peak) {
            if (peak.adjustmentType === "PERCENTAGE") {
              dailyPrice += (dailyPrice * peak.value) / 100;
            } else {
              dailyPrice += peak.value;
            }
          }

          total += dailyPrice;
          current.setDate(current.getDate() + 1);
        }

        if (cheapestPrice === null || total < cheapestPrice) {
          cheapestPrice = total;
        }
      }

      if (cheapestPrice !== null) {
        result.push({
          id: property.id,
          name: property.name,
          image: property.image,
          city: property.city,
          categoryId: property.categoryId,
          cheapestPrice,
        });
      }
    }

    // 3️⃣ Sort by price jika diperlukan
    if (sort === "price_asc") {
      result.sort((a, b) => a.cheapestPrice - b.cheapestPrice);
    }

    if (sort === "price_desc") {
      result.sort((a, b) => b.cheapestPrice - a.cheapestPrice);
    }

    if (sort === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return {
      data: result,
      page,
      limit,
    };
  }
}
