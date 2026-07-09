import crypto from "crypto";
import type { MenuItem } from "../models/menu.types";
import type { MenuItemInput } from "../validators/menuCrud.schema";

const menuItems: MenuItem[] = [
  {
    id: "menu_001",
    name: "Paneer Butter Masala",
    category: "Main Course",
    halfPrice: 140,
    fullPrice: 240,
    isAvailable: true,
  },
  {
    id: "menu_002",
    name: "Veg Fried Rice",
    category: "Main Course",
    singlePrice: 180,
    isAvailable: true,
  },
  {
    id: "menu_003",
    name: "Lemon Soda",
    category: "Beverages",
    singlePrice: 60,
    isAvailable: true,
  },
];

export function listMenuItems(): MenuItem[] {
  return menuItems;
}

export function createMenuItem(input: MenuItemInput): MenuItem {
  const item: MenuItem = {
    id: `menu_${crypto.randomUUID()}`,
    name: input.name,
    category: input.category,
    singlePrice: input.singlePrice,
    halfPrice: input.halfPrice,
    fullPrice: input.fullPrice,
    isAvailable: true,
  };

  menuItems.unshift(item);
  return item;
}

export function updateMenuItem(
  id: string,
  input: MenuItemInput,
): MenuItem | undefined {
  const index = menuItems.findIndex((item) => item.id === id);

  if (index === -1) {
    return undefined;
  }

  menuItems[index] = {
    ...menuItems[index],
    ...input,
  };

  return menuItems[index];
}

export function deleteMenuItem(id: string): boolean {
  const index = menuItems.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  menuItems.splice(index, 1);
  return true;
}

export function toggleMenuItemAvailability(id: string): MenuItem | undefined {
  const item = menuItems.find((entry) => entry.id === id);

  if (!item) {
    return undefined;
  }

  item.isAvailable = !item.isAvailable;
  return item;
}

export function publishMenu(): { success: boolean; message: string } {
  return {
    success: true,
    message: "Menu published successfully. QR and customer views can now use the latest menu.",
  };
}
