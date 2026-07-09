import type { Express } from "express";
import { extractMenuDraft } from "../services/menuExtractionService";
import { validateMenuExtractionRequest } from "../validators/menuExtraction.schema";

export function processMenuExtractionPayload(
  payload: unknown,
  file?: Express.Multer.File,
): {
  success: boolean;
  message: string;
  data?: {
    restaurantName: string;
    location: string;
    sessionToken: string;
    imageName: string;
    confidence: number;
    items: {
      id: string;
      name: string;
      singlePrice?: number;
      halfPrice?: number;
      fullPrice?: number;
    }[];
  };
} {
  const result = validateMenuExtractionRequest(payload);

  if (!result.success) {
    return { success: false, message: result.error };
  }

  if (!file) {
    return { success: false, message: "Menu image file is required." };
  }

  return extractMenuDraft(result.data, file.originalname);
}
