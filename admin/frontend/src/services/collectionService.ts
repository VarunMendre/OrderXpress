export type CollectionTrend = {
  label: string;
  revenue: number;
};

export type CollectionSummary = {
  date: string;
  ordersCount: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  totalRevenue: number;
  avgOrderValue: number;
};

export type CollectionOrder = {
  id: string;
  tableNumber: number;
  paymentStatus: "pending" | "paid" | "failed";
  totalAmount: number;
  status: "pending" | "accepted" | "preparing" | "served" | "cancelled";
  createdAt: string;
};

type CollectionsResponse = {
  success: boolean;
  message: string;
  data?: {
    summary: CollectionSummary;
    items: CollectionOrder[];
    trends: CollectionTrend[];
  };
};

async function parseResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function listCollections(date?: string): Promise<CollectionsResponse> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await fetch(`http://127.0.0.1:4001/collections${query}`);
  return parseResponse<CollectionsResponse>(response);
}

