import { AuthRequest } from "../validators/auth.schema";

export type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    mode: "login" | "register";
    email: string;
    restaurantName?: string;
    adminId: string;
    restaurantId: string;
  };
};

export function handleAuthRequest(request: AuthRequest): AuthResponse {
  if (request.mode === "login") {
    return {
      success: true,
      message: "Login flow accepted. Connect this to the session store next.",
      data: {
        mode: "login",
        email: request.email,
        adminId: "admin_demo_001",
        restaurantId: "restaurant_demo_001",
      },
    };
  }

  return {
    success: true,
    message: `Registration flow accepted for ${request.restaurantName}. Connect this to restaurant creation next.`,
    data: {
      mode: "register",
      email: request.email,
      restaurantName: request.restaurantName,
      adminId: "admin_demo_001",
      restaurantId: "restaurant_demo_001",
    },
  };
}
