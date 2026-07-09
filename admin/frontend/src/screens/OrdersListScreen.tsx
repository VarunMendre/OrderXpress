import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { TextField } from "../components/TextField";
import { listOrders, type OrderRecord, updateOrderStatus } from "../services/orderService";
import { colors, radius, spacing } from "../theme/tokens";

type OrdersListScreenProps = {
  onOpenOrderDetails: (orderId: string) => void;
};

export function OrdersListScreen({ onOpenOrderDetails }: OrdersListScreenProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [status, setStatus] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState({ pending: 0, active: 0, served: 0, totalRevenue: 0 });

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  async function loadOrders() {
    const result = await listOrders({
      status: status || undefined,
      tableNumber: tableNumber || undefined,
      search: search || undefined,
    });

    if (!result.success || !result.data) {
      setMessage(result.message);
      setOrders([]);
      return;
    }

    setOrders(result.data.items);
    setSummary(result.data.summary);
    setSelectedOrderId(result.data.items[0]?.id ?? null);
    setMessage(result.message);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const handleRefresh = async () => {
    await loadOrders();
  };

  const handleQuickStatus = async (orderId: string, nextStatus: OrderRecord["status"]) => {
    const result = await updateOrderStatus(orderId, nextStatus);
    setMessage(result.message);
    await loadOrders();
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Orders List</Text>
        <Text style={styles.title}>Live incoming order feed</Text>
        <Text style={styles.subtitle}>
          Filter by status, table, or text, then open any order for a quick detail preview.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Pending" value={String(summary.pending)} hint="Waiting in queue" />
        <StatCard label="Active" value={String(summary.active)} hint="Accepted or preparing" />
        <StatCard label="Served" value={String(summary.served)} hint="Completed orders" />
      </View>

      <SectionCard title="Filters" subtitle="Narrow the feed before opening an order.">
        <View style={styles.form}>
          <TextField label="Status" placeholder="pending" value={status} onChangeText={setStatus} />
          <TextField
            label="Table Number"
            placeholder="4"
            value={tableNumber}
            onChangeText={setTableNumber}
            keyboardType="number-pad"
          />
          <TextField
            label="Search"
            placeholder="Item name or order id"
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.actionRow}>
            <PrimaryButton label="Apply Filters" onPress={() => void loadOrders()} />
            <PrimaryButton label="Refresh Feed" onPress={() => void handleRefresh()} />
          </View>
        </View>
      </SectionCard>

      <SectionCard
        title="Incoming Orders"
        subtitle={message || "The latest orders will appear here with live queue controls."}
      >
        <View style={styles.orderList}>
          {orders.map((order) => {
            const isSelected = order.id === selectedOrderId;
            return (
              <View key={order.id} style={[styles.orderCard, isSelected && styles.orderCardSelected]}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderMeta}>
                      Table {order.tableNumber} | {order.status} | {order.paymentStatus}
                    </Text>
                  </View>
                  <Text style={styles.amount}>Rs {order.totalAmount}</Text>
                </View>

                <Text style={styles.orderSummary}>
                  {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                </Text>

                <View style={styles.itemActions}>
                  <PrimaryButton
                    label="View Details"
                    onPress={() => {
                      setSelectedOrderId(order.id);
                      onOpenOrderDetails(order.id);
                    }}
                  />
                  <PrimaryButton
                    label="Preparing"
                    onPress={() => void handleQuickStatus(order.id, "preparing")}
                  />
                  <PrimaryButton
                    label="Served"
                    onPress={() => void handleQuickStatus(order.id, "served")}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </SectionCard>

      {selectedOrder ? (
        <SectionCard title="Selected Order" subtitle="Preview the current order before opening the full detail page.">
          <View style={styles.detailBox}>
            <Text style={styles.detailLine}>Restaurant: {selectedOrder.restaurantName}</Text>
            <Text style={styles.detailLine}>Table: {selectedOrder.tableNumber}</Text>
            <Text style={styles.detailLine}>Customer: {selectedOrder.customerMobile || "Not provided"}</Text>
            <Text style={styles.detailLine}>Created: {selectedOrder.createdAt}</Text>
            <Text style={styles.detailLine}>Updated: {selectedOrder.updatedAt}</Text>
          </View>
        </SectionCard>
      ) : null}
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  orderList: {
    gap: spacing.md,
  },
  orderCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  orderCardSelected: {
    borderColor: colors.primary,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  orderId: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  orderSummary: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  itemActions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  detailBox: {
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
});
