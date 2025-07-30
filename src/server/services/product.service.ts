
import 'server-only'

import { buildCrudService } from "@/server/services/base.service";
import { db } from "@/server/db";
import type { TCreateProductSchema } from "@/lib/schemas/product";
import type { Product } from "prisma/interfaces";

export const ProductService = {
  ...buildCrudService<TCreateProductSchema>("product"),

  create: (data: TCreateProductSchema): Promise<Product> =>
    db.$transaction(async (tx) => {
      const { variants, ...productData } = data;
      const product = await tx.product.create({ data: productData });
      if (variants?.length) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({ ...v, productId: product.id })),
        });
      }
      return product;
    }),

  recomputeRating: async (productId: string): Promise<Product> => {
    const agg = await db.productReview.aggregate({
      where: { productId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return db.product.update({
      where: { id: productId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });
  },
};
