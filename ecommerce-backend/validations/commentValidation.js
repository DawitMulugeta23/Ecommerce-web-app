// backend/validations/commentValidation.js
import { z } from "zod";

export const addCommentSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string()
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment too long"),
  }),
});

export const commentIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid comment ID format"),
  }),
});

export const replyToCommentSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Reply cannot be empty").max(300, "Reply too long"),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid comment ID format"),
  }),
});

export const getProductCommentsSchema = z.object({
  params: z.object({
    productId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
