import { TableSessionRequest } from "../validators/session.schema";

export type TableSession = TableSessionRequest & {
  sessionId: string;
  expiresAt: string;
};

export function createTableSession(
  request: TableSessionRequest,
): TableSession {
  const sessionId = `sess_${request.restaurantId}_${request.tableId}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString();

  return {
    ...request,
    sessionId,
    expiresAt,
  };
}
