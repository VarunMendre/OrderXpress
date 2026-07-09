import crypto from "crypto";
import QRCode from "qrcode";
import { QRSessionRecord } from "../models/qr.types";
import { CreateQrSessionInput } from "../validators/qr.schema";

const qrSessions = new Map<string, QRSessionRecord>();

function getQrSecret() {
  return process.env.QR_SESSION_SECRET ?? "orderxpress-qr-secret";
}

function buildSignature(input: {
  restaurantId: string;
  tableNumber: number;
  expiresAt: string;
  nonce: string;
}) {
  return crypto
    .createHmac("sha256", getQrSecret())
    .update(`${input.restaurantId}:${input.tableNumber}:${input.expiresAt}:${input.nonce}`)
    .digest("hex");
}

export async function createQrSessionResponse(input: CreateQrSessionInput) {
  const sessionId = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + input.sessionDurationMinutes * 60_000).toISOString();
  const signature = buildSignature({
    restaurantId: input.restaurantId,
    tableNumber: input.tableNumber,
    expiresAt,
    nonce,
  });

  const payload = JSON.stringify({
    type: "orderxpress-qr",
    sessionId,
    restaurantId: input.restaurantId,
    restaurantName: input.restaurantName,
    tableNumber: input.tableNumber,
    expiresAt,
    nonce,
    signature,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 8,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });

  const record: QRSessionRecord = {
    sessionId,
    restaurantId: input.restaurantId,
    restaurantName: input.restaurantName,
    tableNumber: input.tableNumber,
    expiresAt,
    signature,
    payload,
    qrCodeDataUrl,
    status: "active",
  };

  qrSessions.set(sessionId, record);

  return {
    success: true,
    message: "QR session generated successfully.",
    data: record,
  };
}

export function getQrSessionCount() {
  return qrSessions.size;
}

