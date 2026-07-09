import { z } from "zod";

export const ordersQuerySchema = z.object({
  status: z.enum(["pending", "accepted", "preparing", "served", "cancelled"]).optional(),
  tableNumber: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).optional(),
});

export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;

