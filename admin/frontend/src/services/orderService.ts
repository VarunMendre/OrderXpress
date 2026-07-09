export type OrderStatus = "pending" | "accepted" | "preparing" | "served" | "cancelled";

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderRecord = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  customerMobile?: string;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  notes?: string;
};

type OrdersResponse = {
  success: boolean;
  message: string;
  data?: {
    items: OrderRecord[];
    totalCount: number;
    summary: {
      pending: number;
      active: number;
      served: number;
      totalRevenue: number;
    };
  };
};

type SingleOrderResponse = {
  success: boolean;
  message: string;
  data?: OrderRecord;
};

type OrderStatusResponse = {
  success: boolean;
  message: string;
  data?: OrderRecord;
};

function buildQuery(params: { status?: string; tableNumber?: string; search?: string }) {
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.tableNumber) query.set("tableNumber", params.tableNumber);
  if (params.search) query.set("search", params.search);

  const queryString = query.toString();
  return queryString.length > 0 ? `?${queryString}` : "";
}

async function parseResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function listOrders(filters: {
  status?: string;
  tableNumber?: string;
  search?: string;
}): Promise<OrdersResponse> {
  const response = await fetch(`http://127.0.0.1:4001/orders${buildQuery(filters)}`);
  return parseResponse<OrdersResponse>(response);
}

export async function getOrderById(id: string): Promise<SingleOrderResponse> {
  const response = await fetch(`http://127.0.0.1:4001/orders/${id}`);
  return parseResponse<SingleOrderResponse>(response);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderStatusResponse> {
  const response = await fetch(`http://127.0.0.1:4001/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return parseResponse<OrderStatusResponse>(response);
}

