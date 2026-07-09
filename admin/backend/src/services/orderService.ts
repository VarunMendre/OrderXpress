import crypto from "crypto";
import { OrderRecord, OrderStatus } from "../models/order.types";
import { OrdersQueryInput } from "../validators/order.schema";

const now = Date.now();

const orders = new Map<string, OrderRecord>([
  [
    "order-101",
    {
      id: "order-101",
      restaurantId: "restaurant-demo-id",
      restaurantName: "OrderXpress Demo Kitchen",
      tableNumber: 4,
      customerMobile: "9876543210",
      status: "preparing",
      paymentStatus: "paid",
      totalAmount: 480,
      createdAt: new Date(now - 12 * 60_000).toISOString(),
      updatedAt: new Date(now - 4 * 60_000).toISOString(),
      items: [
        { name: "Paneer Butter Masala", quantity: 1, price: 220 },
        { name: "Butter Naan", quantity: 2, price: 60 },
        { name: "Mango Lassi", quantity: 1, price: 140 },
      ],
      notes: "No spicy food.",
    },
  ],
  [
    "order-102",
    {
      id: "order-102",
      restaurantId: "restaurant-demo-id",
      restaurantName: "OrderXpress Demo Kitchen",
      tableNumber: 7,
      status: "pending",
      paymentStatus: "pending",
      totalAmount: 310,
      createdAt: new Date(now - 6 * 60_000).toISOString(),
      updatedAt: new Date(now - 6 * 60_000).toISOString(),
      items: [
        { name: "Veg Burger", quantity: 1, price: 190 },
        { name: "French Fries", quantity: 1, price: 120 },
      ],
    },
  ],
  [
    "order-103",
    {
      id: "order-103",
      restaurantId: "restaurant-demo-id",
      restaurantName: "OrderXpress Demo Kitchen",
      tableNumber: 2,
      customerMobile: "9123456780",
      status: "served",
      paymentStatus: "paid",
      totalAmount: 640,
      createdAt: new Date(now - 42 * 60_000).toISOString(),
      updatedAt: new Date(now - 22 * 60_000).toISOString(),
      items: [
        { name: "Chicken Biryani", quantity: 2, price: 260 },
        { name: "Raita", quantity: 2, price: 60 },
      ],
    },
  ],
]);

function matchesStatus(order: OrderRecord, status?: OrderStatus) {
  return !status || order.status === status;
}

function matchesTable(order: OrderRecord, tableNumber?: number) {
  return !tableNumber || order.tableNumber === tableNumber;
}

function matchesSearch(order: OrderRecord, search?: string) {
  if (!search) {
    return true;
  }

  const needle = search.toLowerCase();
  return (
    order.id.toLowerCase().includes(needle) ||
    order.restaurantName.toLowerCase().includes(needle) ||
    order.items.some((item) => item.name.toLowerCase().includes(needle))
  );
}

export function listOrdersResponse(query: OrdersQueryInput) {
  const items = [...orders.values()]
    .filter((order) => matchesStatus(order, query.status))
    .filter((order) => matchesTable(order, query.tableNumber))
    .filter((order) => matchesSearch(order, query.search))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    success: true,
    message: "Orders loaded successfully.",
    data: {
      items,
      totalCount: items.length,
      summary: {
        pending: items.filter((item) => item.status === "pending").length,
        active: items.filter((item) => item.status === "accepted" || item.status === "preparing").length,
        served: items.filter((item) => item.status === "served").length,
        totalRevenue: items.reduce((sum, item) => sum + item.totalAmount, 0),
      },
    },
  };
}

export function getOrderByIdResponse(id: string) {
  const order = orders.get(id);

  if (!order) {
    return {
      success: false,
      message: "Order not found.",
    };
  }

  return {
    success: true,
    message: "Order loaded successfully.",
    data: order,
  };
}

export function updateOrderStatusResponse(id: string, status: OrderStatus) {
  const order = orders.get(id);

  if (!order) {
    return {
      success: false,
      message: "Order not found.",
    };
  }

  const updated: OrderRecord = {
    ...order,
    status,
    updatedAt: new Date().toISOString(),
  };

  orders.set(id, updated);

  return {
    success: true,
    message: "Order status updated.",
    data: updated,
  };
}

