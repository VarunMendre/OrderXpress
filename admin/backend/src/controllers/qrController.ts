import { createQrSessionSchema } from "../validators/qr.schema";
import { createQrSessionResponse } from "../services/qrService";

export async function processQrSessionPayload(body: unknown) {
  const parsed = createQrSessionSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid QR generation payload.",
      errors: parsed.error.flatten(),
    };
  }

  return createQrSessionResponse(parsed.data);
}

