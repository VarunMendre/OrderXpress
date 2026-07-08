export type ActiveTableSession = {
  sessionId: string;
  restaurantId: string;
  tableId: string;
  expiresAt: string;
  canPlaceOrders: boolean;
};
