import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  publishMenu,
  toggleMenuItemAvailability,
  updateMenuItem,
} from "../services/menuCrudService";
import { validateMenuItemInput } from "../validators/menuCrud.schema";

export function getMenuItemsResponse(): { success: boolean; data?: unknown; message?: string } {
  return { success: true, data: listMenuItems() };
}

export function createMenuItemResponse(payload: unknown): {
  success: boolean;
  data?: unknown;
  message?: string;
} {
  const result = validateMenuItemInput(payload);

  if (!result.success) {
    return { success: false, message: result.error };
  }

  return { success: true, data: createMenuItem(result.data) };
}

export function updateMenuItemResponse(
  id: string,
  payload: unknown,
): { success: boolean; data?: unknown; message?: string } {
  const result = validateMenuItemInput(payload);

  if (!result.success) {
    return { success: false, message: result.error };
  }

  const updated = updateMenuItem(id, result.data);

  if (!updated) {
    return { success: false, message: "Menu item not found." };
  }

  return { success: true, data: updated };
}

export function deleteMenuItemResponse(id: string): { success: boolean; message: string } {
  const deleted = deleteMenuItem(id);

  if (!deleted) {
    return { success: false, message: "Menu item not found." };
  }

  return { success: true, message: "Menu item deleted." };
}

export function toggleAvailabilityResponse(id: string): {
  success: boolean;
  data?: unknown;
  message?: string;
} {
  const updated = toggleMenuItemAvailability(id);

  if (!updated) {
    return { success: false, message: "Menu item not found." };
  }

  return { success: true, data: updated };
}

export function publishMenuResponse(): { success: boolean; message: string } {
  return publishMenu();
}
