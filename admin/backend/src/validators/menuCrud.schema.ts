import type { MenuCategory } from "../models/menu.types";

export type MenuItemInput = {
  name: string;
  category: MenuCategory;
  singlePrice?: number;
  halfPrice?: number;
  fullPrice?: number;
};

export function validateMenuItemInput(input: unknown):
  | { success: true; data: MenuItemInput }
  | { success: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { success: false, error: "Invalid menu item." };
  }

  const candidate = input as Record<string, unknown>;
  const name = candidate.name;
  const category = candidate.category;
  const singlePrice = candidate.singlePrice;
  const halfPrice = candidate.halfPrice;
  const fullPrice = candidate.fullPrice;

  const allowedCategories: MenuCategory[] = [
    "Starters",
    "Main Course",
    "Beverages",
    "Desserts",
  ];

  if (typeof name !== "string" || name.trim().length < 2) {
    return { success: false, error: "Item name is required." };
  }

  if (typeof category !== "string" || !allowedCategories.includes(category as MenuCategory)) {
    return { success: false, error: "Invalid category." };
  }

  const hasInvalidPrice =
    (singlePrice !== undefined && typeof singlePrice !== "number") ||
    (halfPrice !== undefined && typeof halfPrice !== "number") ||
    (fullPrice !== undefined && typeof fullPrice !== "number");

  if (hasInvalidPrice) {
    return { success: false, error: "Prices must be numbers." };
  }

  return {
    success: true,
    data: {
      name: name.trim(),
      category: category as MenuCategory,
      singlePrice: typeof singlePrice === "number" ? singlePrice : undefined,
      halfPrice: typeof halfPrice === "number" ? halfPrice : undefined,
      fullPrice: typeof fullPrice === "number" ? fullPrice : undefined,
    },
  };
}
