export type QRSessionRecord = {
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

