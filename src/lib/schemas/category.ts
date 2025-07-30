import { z } from "zod";
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(slugRegex),
  description: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  parentId: z.string().uuid().nullable().optional(),
});
export const updateCategorySchema = createCategorySchema.partial();
export const categoryIdSchema = z.object({ id: z.string().uuid() });


export type TCreateCategorySchema = z.infer<typeof createCategorySchema>
export type TUpdateCategorySchema = z.infer<typeof updateCategorySchema>
