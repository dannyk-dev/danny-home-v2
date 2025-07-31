import { z } from "zod";

/* ---------------------------------- shared --------------------------------- */
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().regex(slugRegex, "Must be kebab-case, lowercase a-z, 0-9");

/* --------------------------------------------------------------------------- */
/*  CATEGORY (top-level)                                                       */
/* --------------------------------------------------------------------------- */
export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug,
  description: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  // 🔹  no parentId here anymore – categories are top-level
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

/* --------------------------------------------------------------------------- */
/*  SUB-CATEGORY (child of Category)                                           */
/* --------------------------------------------------------------------------- */
export const createSubCategorySchema = z.object({
  name: z.string().min(2),
  slug,
  categoryId: z.string().uuid(),          // required parent link
  description: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateSubCategorySchema = createSubCategorySchema.partial().extend({
  categoryId: z.string().uuid().optional(), // allow re-parenting
});

export const subCategoryIdSchema = z.object({
  id: z.string().uuid(),
});

/* --------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* --------------------------------------------------------------------------- */
export type TCreateCategorySchema      = z.infer<typeof createCategorySchema>;
export type TUpdateCategorySchema      = z.infer<typeof updateCategorySchema>;
export type TCreateSubCategorySchema   = z.infer<typeof createSubCategorySchema>;
export type TUpdateSubCategorySchema   = z.infer<typeof updateSubCategorySchema>;
