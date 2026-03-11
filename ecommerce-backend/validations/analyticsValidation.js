import { z } from "zod";

export const analyticsQuerySchema = z.object({
  query: z.object({
    timeRange: z.enum(["7days", "30days", "90days", "year"]).optional(),
    category: z.string().optional(),
    sortBy: z.enum(["demand", "popularity", "revenue"]).optional(),
  }),
});
