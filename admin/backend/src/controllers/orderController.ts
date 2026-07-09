import { ordersQuerySchema } from "../validators/order.schema";
import {
  getOrderByIdResponse,
  listOrdersResponse,
  updateOrderStatusResponse,
} from "../services/orderService";

const statusValues = ["pending", "accepted", "preparing", "served", "cancelled"] as const;

export function processOrdersQuery(query: unknown) {
  const parsed = ordersQuerySchema.safeParse(query);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid orders query.",
      errors: parsed.error.flatten(),
    };
  }

  return listOrdersResponse(parsed.data);
}

export function processOrderLookup(id: string) {
  return getOrderByIdResponse(id);
}

export function processOrderStatusChange(id: string, body: unknown) {
  const status = typeof body === "object" && body !== null ? (body as { status?: string }).status : undefined;

  if (!status || !statusValues.includes(status as (typeof statusValues)[number])) {
    return {
      success: false,
      message: "Invalid order status.",
    };
  }

  return updateOrderStatusResponse(id, status as (typeof statusValues)[number]);
}

