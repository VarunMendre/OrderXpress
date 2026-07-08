export type TableSessionRequest = {
  restaurantId: string;
  tableId: string;
  qrToken: string;
};

export type TableSessionValidationResult =
  | { success: true; data: TableSessionRequest }
  | { success: false; error: string };

export function validateTableSessionRequest(
  input: unknown,
): TableSessionValidationResult {
  if (typeof input !== "object" || input === null) {
    return { success: false, error: "Invalid table session request." };
  }

  const candidate = input as Record<string, unknown>;
  const restaurantId = candidate.restaurantId;
  const tableId = candidate.tableId;
  const qrToken = candidate.qrToken;

  if (typeof restaurantId !== "string" || restaurantId.trim().length < 2) {
    return { success: false, error: "Invalid restaurant id." };
  }

  if (typeof tableId !== "string" || tableId.trim().length < 1) {
    return { success: false, error: "Invalid table id." };
  }

  if (typeof qrToken !== "string" || qrToken.trim().length < 12) {
    return { success: false, error: "Invalid QR token." };
  }

  return {
    success: true,
    data: {
      restaurantId: restaurantId.trim(),
      tableId: tableId.trim(),
      qrToken: qrToken.trim(),
    },
  };
}
