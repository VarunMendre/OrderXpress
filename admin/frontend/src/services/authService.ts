type AuthMode = "login" | "register";

export type AuthRequest = {
  mode: AuthMode;
  email: string;
  password: string;
  restaurantName?: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    mode: AuthMode;
    email: string;
    restaurantName?: string;
    adminId: string;
    restaurantId: string;
  };
};

export async function submitAuthRequest(
  payload: AuthRequest,
): Promise<AuthResponse> {
  const response = await fetch("http://127.0.0.1:4001/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? "Auth request failed.",
    };
  }

  return data;
}
