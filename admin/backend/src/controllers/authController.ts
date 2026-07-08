import { handleAuthRequest } from "../services/authService";
import { validateAuthRequest } from "../validators/auth.schema";

export function processAuthPayload(payload: unknown): {
  success: boolean;
  message: string;
  data?: {
    mode: "login" | "register";
    email: string;
    restaurantName?: string;
    adminId: string;
    restaurantId: string;
  };
} {
  const result = validateAuthRequest(payload);

  if (!result.success) {
    return { success: false, message: result.error };
  }

  return handleAuthRequest(result.data);
}
