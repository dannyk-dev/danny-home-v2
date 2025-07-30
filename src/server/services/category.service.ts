import { db } from "@/server/db";
import { buildCrudService } from "./base.service";
import type { TCreateCategorySchema } from "@/lib/schemas/category";

export const CategoryService = {
  ...buildCrudService<TCreateCategorySchema>("category"),
  listWithChildren: async () =>  await db.category.findMany({ include: { children: true } })
};
