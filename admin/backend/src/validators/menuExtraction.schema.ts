export type MenuExtractionRequest = {
  restaurantName: string;
  location: string;
  sessionToken: string;
};

export type MenuExtractionValidationResult =
  | { success: true; data: MenuExtractionRequest }
  | { success: false; error: string };

export function validateMenuExtractionRequest(
  input: unknown,
): MenuExtractionValidationResult {
  if (typeof input !== "object" || input === null) {
    return { success: false, error: "Invalid menu extraction request." };
  }

  const candidate = input as Record<string, unknown>;
  const restaurantName = candidate.restaurantName;
  const location = candidate.location;
  const sessionToken = candidate.sessionToken;

  if (typeof restaurantName !== "string" || restaurantName.trim().length < 2) {
    return { success: false, error: "Restaurant name is required." };
  }

  if (typeof location !== "string" || location.trim().length < 2) {
    return { success: false, error: "Location is required." };
  }

  if (typeof sessionToken !== "string" || sessionToken.trim().length < 8) {
    return { success: false, error: "Session token is required." };
  }

  return {
    success: true,
    data: {
      restaurantName: restaurantName.trim(),
      location: location.trim(),
      sessionToken: sessionToken.trim(),
    },
  };
}
