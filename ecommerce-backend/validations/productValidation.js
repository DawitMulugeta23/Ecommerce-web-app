// backend/validations/productValidation.js
import { z } from "zod";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Other",
];

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .max(100, "Product name too long"),
    price: z.number().positive("Price must be positive"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.enum(CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      }),
    }),
    countInStock: z
      .number()
      .int()
      .min(0, "Stock cannot be negative")
      .default(5),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    price: z.number().positive().optional(),
    description: z.string().min(10).optional(),
    category: z.enum(CATEGORIES).optional(),
    countInStock: z.number().int().min(0).optional(),
    image: z.string().url().optional(),
    oldPrice: z.number().positive().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
  }),
});
