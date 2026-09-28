import { z } from "zod";

export const createOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z
            .number()
            .int()
            .positive(),

          quantity: z
            .number()
            .int()
            .positive(),
        })
      )
      .min(1, "Order must contain at least one product"),
  })
  .superRefine((order, ctx) => {
    const productIds = order.items.map(
      (item) => item.productId
    );

    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "A product cannot appear more than once in an order",
        path: ["items"],
      });
    }
  });