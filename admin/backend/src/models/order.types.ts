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

