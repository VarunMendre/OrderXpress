import { OrderRecord } from "../models/order.types";
import { CollectionsQueryInput } from "../validators/collection.schema";

type CollectionSummary = {
  date: string;
  ordersCount: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  totalRevenue: number;
  avgOrderValue: number;
};

const collectionOrders: OrderRecord[] = [
  {
    id: "order-101",
    restaurantId: "restaurant-demo-id",
    restaurantName: "OrderXpress Demo Kitchen",
    tableNumber: 4,
    customerMobile: "9876543210",
    status: "preparing",
    paymentStatus: "paid",
    totalAmount: 480,
    createdAt: "2026-07-09T08:12:00.000Z",
    updatedAt: "2026-07-09T08:18:00.000Z",
    items: [
      { name: "Paneer Butter Masala", quantity: 1, price: 220 },
      { name: "Butter Naan", quantity: 2, price: 60 },
      { name: "Mango Lassi", quantity: 1, price: 140 },
    ],
  },
  {
    id: "order-102",
    restaurantId: "restaurant-demo-id",
    restaurantName: "OrderXpress Demo Kitchen",
    tableNumber: 7,
    status: "pending",
    paymentStatus: "pending",
    totalAmount: 310,
    createdAt: "2026-07-09T09:06:00.000Z",
    updatedAt: "2026-07-09T09:06:00.000Z",
    items: [
      { name: "Veg Burger", quantity: 1, price: 190 },
      { name: "French Fries", quantity: 1, price: 120 },
    ],
  },
  {
    id: "order-103",
    restaurantId: "restaurant-demo-id",
    restaurantName: "OrderXpress Demo Kitchen",
    tableNumber: 2,
    customerMobile: "9123456780",
    status: "served",
    paymentStatus: "paid",
    totalAmount: 640,
    createdAt: "2026-07-08T19:22:00.000Z",
    updatedAt: "2026-07-08T19:42:00.000Z",
    items: [
      { name: "Chicken Biryani", quantity: 2, price: 260 },
      { name: "Raita", quantity: 2, price: 60 },
    ],
  },
];

function getDateKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function calculateSummary(date: string, orders: OrderRecord[]): CollectionSummary {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    date,
    ordersCount: orders.length,
    paidOrdersCount: orders.filter((order) => order.paymentStatus === "paid").length,
    pendingOrdersCount: orders.filter((order) => order.paymentStatus === "pending").length,
    totalRevenue,
    avgOrderValue: orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0,
  };
}

export function getCollectionsResponse(query: CollectionsQueryInput) {
  const dateKey = query.date ?? getDateKey(collectionOrders[0]?.createdAt ?? new Date().toISOString());
  const items = collectionOrders.filter((order) => getDateKey(order.createdAt) === dateKey);
  const summary = calculateSummary(dateKey, items);

  return {
    success: true,
    message: "Collection data loaded successfully.",
    data: {
      summary,
      items,
      trends: [
        { label: "Morning", revenue: 480 },
        { label: "Afternoon", revenue: 310 },
        { label: "Evening", revenue: 640 },
      ],
    },
  };
}

