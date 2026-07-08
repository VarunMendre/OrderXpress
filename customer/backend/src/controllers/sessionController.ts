import {
  validateTableSessionRequest,
  type TableSessionRequest,
} from "../validators/session.schema";
import { createTableSession } from "../services/sessionService";

export function processTableSessionPayload(
  payload: unknown,
): { success: true; data: ReturnType<typeof createTableSession> } | { success: false; error: string } {
  const result = validateTableSessionRequest(payload);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    data: createTableSession(result.data),
  };
}

export type { TableSessionRequest };
