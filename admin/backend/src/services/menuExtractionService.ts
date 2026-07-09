import { MenuExtractionRequest } from "../validators/menuExtraction.schema";

export type MenuItemDraft = {
  id: string;
  name: string;
  singlePrice?: number;
  halfPrice?: number;
  fullPrice?: number;
};

export type MenuExtractionResponse = {
  success: boolean;
  message: string;
  data?: {
    restaurantName: string;
    location: string;
    sessionToken: string;
    imageName: string;
    confidence: number;
    items: MenuItemDraft[];
  };
};

export function extractMenuDraft(
  request: MenuExtractionRequest,
  imageName: string,
): MenuExtractionResponse {
  const items: MenuItemDraft[] = [
    {
      id: "item_001",
      name: "Paneer Butter Masala",
      halfPrice: 140,
      fullPrice: 240,
    },
    {
      id: "item_002",
      name: "Veg Fried Rice",
      singlePrice: 180,
    },
    {
      id: "item_003",
      name: "Lemon Soda",
      singlePrice: 60,
    },
  ];

  return {
    success: true,
    message: "Menu extracted successfully. Review the draft before publishing.",
    data: {
      restaurantName: request.restaurantName,
      location: request.location,
      sessionToken: request.sessionToken,
      imageName,
      confidence: 0.86,
      items,
    },
  };
}
