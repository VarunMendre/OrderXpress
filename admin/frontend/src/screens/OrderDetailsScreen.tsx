import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { getOrderById, updateOrderStatus, type OrderRecord } from "../services/orderService";
import { colors, radius, spacing } from "../theme/tokens";

type OrderDetailsScreenProps = {
  orderId: string;
  onBackToOrders: () => void;
};

export function OrderDetailsScreen({ orderId, onBackToOrders }: OrderDetailsScreenProps) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [message, setMessage] = useState("Loading order details...");

  async function loadOrder() {
    const result = await getOrderById(orderId);

    if (!result.success || !result.data) {
      setOrder(null);
      setMessage(result.message);
      return;
    }

    setOrder(result.data);
    setMessage(result.message);
  }

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const handleStatusChange = async (status: OrderRecord["status"]) => {
    const result = await updateOrderStatus(orderId, status);
    setMessage(result.message);
    if (result.success && result.data) {
      setOrder(result.data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Single Order Details</Text>
        <Text style={styles.title}>{order?.id || orderId}</Text>
        <Text style={styles.subtitle}>
          View the complete order, payment, and timeline data for one customer request.
        </Text>
      </View>

      <SectionCard title="Current Status" subtitle={message}>
        {order ? (
          <View style={styles.summaryBox}>
            <Text style={styles.detailLine}>Restaurant: {order.restaurantName}</Text>
            <Text style={styles.detailLine}>Table: {order.tableNumber}</Text>
            <Text style={styles.detailLine}>Customer Mobile: {order.customerMobile || "Not provided"}</Text>
            <Text style={styles.detailLine}>Payment: {order.paymentStatus}</Text>
            <Text style={styles.detailLine}>Status: {order.status}</Text>
            <Text style={styles.detailLine}>Total: Rs {order.totalAmount}</Text>
            <Text style={styles.detailLine}>Created: {order.createdAt}</Text>
            <Text style={styles.detailLine}>Updated: {order.updatedAt}</Text>
          </View>
        ) : null}
      </SectionCard>

      {order ? (
        <SectionCard title="Order Items" subtitle="Each line shows quantity and item price.">
          <View style={styles.itemList}>
            {order.items.map((item) => (
              <View key={`${item.name}-${item.price}`} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>Rs {item.price}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {order?.notes ? (
        <SectionCard title="Notes" subtitle="Special instructions from the customer.">
          <Text style={styles.detailLine}>{order.notes}</Text>
        </SectionCard>
      ) : null}

      {order ? (
        <SectionCard title="Quick Actions" subtitle="Update the order lifecycle from one screen.">
          <View style={styles.actionRow}>
            <PrimaryButton label="Accept" onPress={() => void handleStatusChange("accepted")} />
            <PrimaryButton label="Preparing" onPress={() => void handleStatusChange("preparing")} />
            <PrimaryButton label="Served" onPress={() => void handleStatusChange("served")} />
            <PrimaryButton label="Cancel" onPress={() => void handleStatusChange("cancelled")} />
          </View>
        </SectionCard>
      ) : null}

      <PrimaryButton label="Back to Orders" onPress={onBackToOrders} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  hero: {
    gap: spacing.xs,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryBox: {
    gap: 6,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  detailLine: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  itemName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  itemPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
