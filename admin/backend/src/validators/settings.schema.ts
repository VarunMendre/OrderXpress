import { z } from "zod";

export const settingsSchema = z.object({
  restaurantName: z.string().min(1),
  tableCount: z.coerce.number().int().positive().max(999),
  bankAccountName: z.string().min(1).optional().default(""),
  bankAccountNumber: z.string().min(1).optional().default(""),
  bankIfscCode: z.string().min(1).optional().default(""),
  supportEmail: z.string().email().optional().default(""),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

