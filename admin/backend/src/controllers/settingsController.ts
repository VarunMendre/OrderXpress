import { settingsSchema } from "../validators/settings.schema";
import { getSettingsResponse, updateSettingsResponse } from "../services/settingsService";

export function processSettingsGet() {
  return getSettingsResponse();
}

export function processSettingsUpdate(body: unknown) {
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid settings payload.",
      errors: parsed.error.flatten(),
    };
  }

  return updateSettingsResponse(parsed.data);
}

