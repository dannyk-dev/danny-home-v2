/* eslint-disable @typescript-eslint/no-unsafe-return */
import "server-only";

import { buildCrudService } from "@/server/services/base.service";
import { db } from "@/server/db";
import {
  storageService,
  type Base64FileInput,
} from "@/server/services/storage.service";
import type {
  TCreateCategorySchema,
  TCreateSubCategorySchema,
  TUpdateCategorySchema,
  TUpdateSubCategorySchema,
} from "@/lib/schemas/category";
import type { Category, SubCategory } from "prisma/interfaces";

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function clean<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

async function maybeUpload(file?: Base64FileInput, uploaderId?: string) {
  if (!file) return undefined;
  const [uploaded] = await storageService.upload(db, [file], uploaderId ?? "");
  return uploaded.key;
}

// ──────────────────────────────────────────────────────────────
// CategoryService (top‑level categories)
// ──────────────────────────────────────────────────────────────
export const CategoryService = {
  ...buildCrudService<TCreateCategorySchema>("category"),

  async create(
    data: TCreateCategorySchema & { imageFile?: Base64FileInput },
    uploaderId?: string,
  ): Promise<Category> {
    const { imageFile, ...fields } = data;
    const key = await maybeUpload(imageFile, uploaderId);

    const prismaData: Prisma.CategoryCreateInput = {
      ...clean(fields),
      attachments: key ? { connect: { key } } : undefined,
    };

    return db.category.create({
      data: prismaData,
      include: { subcategories: true },
    });
  },

  async update(
    id: string,
    data: TUpdateCategorySchema & {
      imageFile?: Base64FileInput;
      removeImage?: boolean;
    },
    uploaderId?: string,
  ): Promise<Category> {
    const { imageFile, removeImage, ...fields } = data;
    const key = await maybeUpload(imageFile, uploaderId);

    // remove old image if flagged
    if (removeImage) {
      const existing = await db.category.findUnique({
        where: { id },
        select: { attachments: { select: { key: true } } },
      });
      if (existing?.attachments?.key)
        await storageService.remove(db, existing.attachments.key);
    }

    const prismaData: Prisma.CategoryUpdateInput = {
      ...clean(fields),
      attachments: removeImage
        ? { disconnect: true }
        : key
          ? { connect: { key } }
          : undefined,
    };

    return db.category.update({
      where: { id },
      data: prismaData,
      include: { subcategories: true },
    });
  },

  listWithSubcategories(): Promise<
    (Category & { subcategories: SubCategory[] })[]
  > {
    return db.category.findMany({
      orderBy: { name: "asc" },
      include: { subcategories: { orderBy: { name: "asc" } } },
    });
  },
};

export const SubCategoryService = {
  ...buildCrudService<TCreateSubCategorySchema>("subCategory"),

  async create(
    data: {
      name: string;
      slug: string;
      categoryId: string;
      description?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      imageFile?: Base64FileInput;
    },
    uploaderId?: string,
  ): Promise<SubCategory> {
    const { imageFile, categoryId, name, slug, ...fields } = data;
    const key = await maybeUpload(imageFile, uploaderId);

    const sub = await db.subCategory.create({
      data: {
        name,
        slug,
        ...clean(fields),
        category: { connect: { id: categoryId } },
        attachments: key ? { connect: { key } } : undefined,
      },
    });
    return sub;
  },

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      imageFile?: Base64FileInput;
      removeImage?: boolean;
      categoryId?: string;
    },
    uploaderId?: string,
  ): Promise<SubCategory> {
    const { imageFile, removeImage, categoryId, ...fields } = data;
    const key = await maybeUpload(imageFile, uploaderId);

    if (removeImage) {
      const existing = await db.subCategory.findUnique({
        where: { id },
        select: { attachments: { select: { key: true } } },
      });
      if (existing?.attachments?.key)
        await storageService.remove(db, existing.attachments.key);
    }

    return await db.subCategory.update({
      where: { id },
      data: {
        ...clean(fields),
        category:
          categoryId !== undefined
            ? { connect: { id: categoryId } }
            : undefined,
        attachments: removeImage
          ? { disconnect: true }
          : key
            ? { connect: { key } }
            : undefined,
      },
    });
  },

  listByCategory(categoryId: string): Promise<SubCategory[]> {
    return db.subCategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
    });
  },
};
