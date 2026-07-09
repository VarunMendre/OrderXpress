import { z } from "zod";

export const createQrSessionSchema = z.object({
  restaurantId: z.string().min(1),
  restaurantName: z.string().min(1),
  tableNumber: z.coerce.number().int().positive().max(999),
  sessionDurationMinutes: z.coerce.number().int().positive().max(24 * 60).default(12 * 60),
});

export type CreateQrSessionInput = z.infer<typeof createQrSessionSchema>;

