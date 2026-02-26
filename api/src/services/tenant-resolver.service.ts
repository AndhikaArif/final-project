// services/tenant-resolver.service.ts

import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";

export class TenantResolverService {
  static async getTenantId(authAccountId: string): Promise<string> {
    const tenant = await prisma.tenant.findUnique({
      where: { authAccountId },
      select: { id: true },
    });

    if (!tenant) {
      throw new AppError(404, "Tenant not found");
    }

    return tenant.id;
  }
}
