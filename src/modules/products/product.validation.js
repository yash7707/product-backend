import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters"),

  description: z
    .string()
    .trim()
    .optional(),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stockQuantity: z
    .number()
    .int("Stock quantity must be an integer")
    .nonnegative("Stock quantity cannot be negative"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),
});

export const updateProductSchema =
  createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .optional(),

  category: z
    .string()
    .trim()
    .optional(),

  inStock: z
    .enum(["true", "false"])
    .optional(),

  page: z
    .coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z
    .coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),
});