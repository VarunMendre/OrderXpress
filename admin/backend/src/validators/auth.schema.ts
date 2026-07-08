export type AuthMode = "register" | "login";

export type AuthRequest = {
  mode: AuthMode;
  email: string;
  password: string;
  restaurantName?: string;
};

export type AuthValidationResult =
  | { success: true; data: AuthRequest }
  | { success: false; error: string };

function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateAuthRequest(input: unknown): AuthValidationResult {
  if (typeof input !== "object" || input === null) {
    return { success: false, error: "Invalid request body." };
  }

  const candidate = input as Record<string, unknown>;
  const mode = candidate.mode;
  const email = candidate.email;
  const password = candidate.password;
  const restaurantName = candidate.restaurantName;

  if (mode !== "login" && mode !== "register") {
    return { success: false, error: "Invalid auth mode." };
  }

  if (typeof email !== "string" || !isEmailLike(email.trim())) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (typeof password !== "string" || password.trim().length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  if (mode === "register") {
    if (typeof restaurantName !== "string" || restaurantName.trim().length < 2) {
      return { success: false, error: "Restaurant name is required." };
    }
  }

  return {
    success: true,
    data: {
      mode,
      email: email.trim().toLowerCase(),
      password,
      restaurantName: typeof restaurantName === "string" ? restaurantName.trim() : undefined,
    },
  };
}
