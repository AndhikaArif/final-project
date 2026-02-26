import { prisma } from "../libs/prisma.lib.js";
import { AppError } from "../errors/app.error.js";
import { TenantResolverService } from "./tenant-resolver.service.js";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../validations/property.validation.js";

export class CategoryService {
  async createCategory(authAccountId: string, data: CreateCategoryDTO) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const exists = await prisma.propertyCategory.findFirst({
      where: { tenantId, name: data.name },
    });
    if (exists)
      throw new AppError(400, "Category with this name already exists");

    return prisma.propertyCategory.create({
      data: { tenantId, name: data.name },
    });
  }

  async updateCategory(
    id: string,
    authAccountId: string,
    data: UpdateCategoryDTO,
  ) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const category = await prisma.propertyCategory.findFirst({
      where: { id, tenantId },
    });

    if (!category) {
      throw new AppError(403, "You are not allowed to update this category");
    }

    return prisma.propertyCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    });
  }

  async deleteCategory(id: string, authAccountId: string) {
    const tenantId = await TenantResolverService.getTenantId(authAccountId);

    const category = await prisma.propertyCategory.findFirst({
      where: { id, tenantId },
    });

    if (!category) {
      throw new AppError(403, "You are not allowed to delete this category");
    }

    return prisma.propertyCategory.delete({
      where: { id },
    });
  }
}
