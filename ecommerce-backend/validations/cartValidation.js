// backend/validations/cartValidation.js
import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
    quantity: z.number().int().positive("Quantity must be positive").default(1),
  }),
});

export const updateCartSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
  }),
});

export const syncCartSchema = z.object({
  body: z.object({
    localCart: z
      .array(
        z.object({
          _id: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional(),
          id: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional(),
          quantity: z.number().int().positive(),
        }),
      )
      .default([]),
  }),
});

export const cartIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
  }),
});
