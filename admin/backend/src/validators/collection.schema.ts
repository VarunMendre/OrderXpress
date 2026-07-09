import { z } from "zod";

export const collectionsQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CollectionsQueryInput = z.infer<typeof collectionsQuerySchema>;

