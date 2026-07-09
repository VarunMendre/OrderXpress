import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { TextField } from "../components/TextField";
import { listCollections, type CollectionOrder, type CollectionSummary, type CollectionTrend } from "../services/collectionService";
import { colors, radius, spacing } from "../theme/tokens";

type CollectionsScreenProps = {
  onBackToHome: () => void;
};

const emptySummary: CollectionSummary = {
  date: "",
  ordersCount: 0,
  paidOrdersCount: 0,
  pendingOrdersCount: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
};

export function CollectionsScreen({ onBackToHome }: CollectionsScreenProps) {
  const [date, setDate] = useState("2026-07-09");
  const [summary, setSummary] = useState<CollectionSummary>(emptySummary);
  const [orders, setOrders] = useState<CollectionOrder[]>([]);
  const [trends, setTrends] = useState<CollectionTrend[]>([]);
  const [message, setMessage] = useState("");

  async function loadCollections() {
    const result = await listCollections(date || undefined);

    if (!result.success || !result.data) {
      setMessage(result.message);
      setOrders([]);
      setTrends([]);
      return;
    }

    setSummary(result.data.summary);
    setOrders(result.data.items);
    setTrends(result.data.trends);
    setMessage(result.message);
  }

  useEffect(() => {
    void loadCollections();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Collections</Text>
        <Text style={styles.title}>Daily revenue dashboard</Text>
        <Text style={styles.subtitle}>
          Filter by date and review revenue, order counts, and simple hourly trend data.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Revenue" value={`Rs ${summary.totalRevenue}`} hint="Selected day total" />
        <StatCard label="Orders" value={String(summary.ordersCount)} hint="All orders for the day" />
        <StatCard label="Avg Order" value={`Rs ${summary.avgOrderValue}`} hint="Basket value" />
      </View>

      <SectionCard title="Date Filter" subtitle="Load another day without leaving the dashboard.">
        <View style={styles.form}>
          <TextField
            label="Collection Date"
            placeholder="2026-07-09"
            value={date}
            onChangeText={setDate}
          />
          <View style={styles.actionRow}>
            <PrimaryButton label="Load Collections" onPress={() => void loadCollections()} />
            <PrimaryButton label="Back to Home" onPress={onBackToHome} />
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Summary" subtitle={message || "Overview for the selected collection date."}>
        <View style={styles.summaryBox}>
          <Text style={styles.detailLine}>Date: {summary.date || date}</Text>
          <Text style={styles.detailLine}>Paid Orders: {summary.paidOrdersCount}</Text>
          <Text style={styles.detailLine}>Pending Payments: {summary.pendingOrdersCount}</Text>
          <Text style={styles.detailLine}>Total Revenue: Rs {summary.totalRevenue}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Collection Orders" subtitle="Orders contributing to the selected daily total.">
        <View style={styles.orderList}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderMeta}>
                Table {order.tableNumber} | {order.status} | {order.paymentStatus}
              </Text>
              <Text style={styles.amount}>Rs {order.totalAmount}</Text>
              <Text style={styles.orderMeta}>{order.createdAt}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Trend Snapshot" subtitle="A small revenue split for the selected day.">
        <View style={styles.trendList}>
          {trends.map((trend) => (
            <View key={trend.label} style={styles.trendRow}>
              <Text style={styles.trendLabel}>{trend.label}</Text>
              <Text style={styles.trendValue}>Rs {trend.revenue}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
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
  orderList: {
    gap: spacing.md,
  },
  orderCard: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  orderId: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  amount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  trendList: {
    gap: spacing.sm,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  trendValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
});
