export type MenuCategory = "Starters" | "Main Course" | "Beverages" | "Desserts";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  singlePrice?: number;
  halfPrice?: number;
  fullPrice?: number;
  isAvailable: boolean;
};

type MenuResponse = {
  success: boolean;
  message?: string;
  data?: MenuItem[];
};

type SingleMenuResponse = {
  success: boolean;
  message?: string;
  data?: MenuItem;
};

async function parseResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function listMenuItems(): Promise<MenuItem[]> {
  const response = await fetch("http://127.0.0.1:4001/menu/items");
  const data = await parseResponse<MenuResponse>(response);
  return response.ok && data.data ? data.data : [];
}

export async function createMenuItem(payload: Omit<MenuItem, "id" | "isAvailable">): Promise<MenuItem | null> {
  const response = await fetch("http://127.0.0.1:4001/menu/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<SingleMenuResponse>(response);
  return response.ok ? data.data ?? null : null;
}

export async function updateMenuItem(
  id: string,
  payload: Omit<MenuItem, "id" | "isAvailable">,
): Promise<MenuItem | null> {
  const response = await fetch(`http://127.0.0.1:4001/menu/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<SingleMenuResponse>(response);
  return response.ok ? data.data ?? null : null;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const response = await fetch(`http://127.0.0.1:4001/menu/items/${id}`, {
    method: "DELETE",
  });
  return response.ok;
}

export async function toggleMenuItemAvailability(id: string): Promise<MenuItem | null> {
  const response = await fetch(`http://127.0.0.1:4001/menu/items/${id}/toggle`, {
    method: "PATCH",
  });

  const data = await parseResponse<SingleMenuResponse>(response);
  return response.ok ? data.data ?? null : null;
}

export async function publishMenu(): Promise<boolean> {
  const response = await fetch("http://127.0.0.1:4001/menu/publish", {
    method: "POST",
  });
  return response.ok;
}
