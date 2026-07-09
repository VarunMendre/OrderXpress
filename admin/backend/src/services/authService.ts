import { AuthRequest } from "../validators/auth.schema";
import crypto from "crypto";

export type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    mode: "login" | "register";
    email: string;
    restaurantName?: string;
    adminId: string;
    restaurantId: string;
    sessionToken: string;
  };
};

type SessionRecord = {
  adminId: string;
  restaurantId: string;
  email: string;
  restaurantName?: string;
  mode: "login" | "register";
  createdAt: number;
};

const sessions = new Map<string, SessionRecord>();

export function handleAuthRequest(request: AuthRequest): AuthResponse {
  const adminId = `admin_${crypto.randomUUID()}`;
  const restaurantId = `restaurant_${crypto.randomUUID()}`;
  const sessionToken = crypto.randomUUID();

  sessions.set(sessionToken, {
    adminId,
    restaurantId,
    email: request.email,
    restaurantName: request.restaurantName,
    mode: request.mode,
    createdAt: Date.now(),
  });

  if (request.mode === "login") {
    return {
      success: true,
      message: "Login successful. Session created.",
      data: {
        mode: "login",
        email: request.email,
        adminId,
        restaurantId,
        sessionToken,
      },
    };
  }

  return {
    success: true,
    message: `Registration successful for ${request.restaurantName}. Session created.`,
    data: {
      mode: "register",
      email: request.email,
      restaurantName: request.restaurantName,
      adminId,
      restaurantId,
      sessionToken,
    },
  };
}

export function getSessionCount(): number {
  return sessions.size;
}
