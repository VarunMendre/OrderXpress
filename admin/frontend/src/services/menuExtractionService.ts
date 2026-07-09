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

export async function submitMenuExtractionRequest(payload: {
  restaurantName: string;
  location: string;
  sessionToken: string;
  image: {
    uri: string;
    name: string;
    type: string;
  };
}): Promise<MenuExtractionResponse> {
  const formData = new FormData();
  formData.append("restaurantName", payload.restaurantName);
  formData.append("location", payload.location);
  formData.append("sessionToken", payload.sessionToken);
  formData.append("menuImage", {
    uri: payload.image.uri,
    name: payload.image.name,
    type: payload.image.type,
  } as unknown as Blob);

  const response = await fetch("http://127.0.0.1:4001/menu/extract", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as MenuExtractionResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? "Menu extraction failed.",
    };
  }

  return data;
}
