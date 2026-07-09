export type CreateQrSessionRequest = {
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  sessionDurationMinutes?: number;
};

export type QrSessionResponse = {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    restaurantId: string;
    restaurantName: string;
    tableNumber: number;
    expiresAt: string;
    signature: string;
    payload: string;
    qrCodeDataUrl: string;
    status: "active" | "revoked";
  };
};

export async function createQrSession(
  payload: CreateQrSessionRequest,
): Promise<QrSessionResponse> {
  const response = await fetch("http://127.0.0.1:4001/qr/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as QrSessionResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? "QR generation failed.",
    };
  }

  return data;
}

