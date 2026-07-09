export type AdminSettingsRecord = {
  restaurantName: string;
  tableCount: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  supportEmail: string;
};

type SettingsResponse = {
  success: boolean;
  message: string;
  data?: AdminSettingsRecord;
};

async function parseResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function getSettings(): Promise<SettingsResponse> {
  const response = await fetch("http://127.0.0.1:4001/settings");
  return parseResponse<SettingsResponse>(response);
}

export async function saveSettings(payload: AdminSettingsRecord): Promise<SettingsResponse> {
  const response = await fetch("http://127.0.0.1:4001/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<SettingsResponse>(response);
}

