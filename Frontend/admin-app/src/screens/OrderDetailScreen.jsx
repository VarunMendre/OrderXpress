import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/admin";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { Button, Badge } from "../components";
import Spinner from "../components/Spinner";
import OrderStatusHistory from "../components/OrderStatusHistory";
import { colors, spacing, radius, shadows } from "../theme";
import { formatCurrency, orderStatusInfo } from "../utils/format";

export default function OrderDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.get(orderId);
      setOrder(data);
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch order:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (action) => {
    if (!order || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await orderApi.updateStatus(order.orderId || order._id, action);
      fetchOrder();
    } catch (e) {
      console.error("Failed to update order status:", e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkCashPaid = async (orderId) => {
    try {
      await orderApi.markCashPaid(orderId);
      fetchOrder();
    } catch (e) {
      console.error("Failed to mark order as paid:", e);
    }
  };

  if (!user) {
    return null;
  }

  if (loading && !order) {
    return (
      <Screen>
        <AppHeader onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  if (error && !order) {
    return (
      <Screen>
        <AppHeader onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={() => fetchOrder()}>Retry</Button>
        </View>
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <AppHeader onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
          <Button onPress={() => navigation.goBack()}>Back to Orders</Button>
        </View>
      </Screen>
    );
  }

  const statusInfo = orderStatusInfo(order);
  const canAccept = ["pending_payment", "accepted", "paid"].includes(order.orderStatus);
  const canComplete = ["accepted", "paid"].includes(order.orderStatus);
  const canCancel = !["completed", "cancelled"].includes(order.orderStatus);
  const itemCount = order.items?.length || order.itemCount || 0;
  const productsLine = (order.items || [])
    .map((i) => i.nameSnapshot || i.name)
    .filter(Boolean)
    .join(", ");

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.detailCard}>
          <DetailRow label="Order ID" value={`#${order.orderNumber || order._id?.slice(-6)}`} />
          <DetailRow
            label="Status"
            value={<Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>}
          />
          <DetailRow label="Items" value={`${itemCount} items`} />
          <DetailRow label="Amount" value={formatCurrency(order.total)} valueStyle={styles.amountValue} />
          {productsLine ? (
            <DetailRow label="Products" value={productsLine} valueStyle={styles.productsValue} />
          ) : null}
          <DetailRow
            label="Time"
            value={order.placedAt ? new Date(order.placedAt).toLocaleString() : "—"}
          />
          {order.customerName || order.phone ? (
            <DetailRow
              label="Customer"
              value={[order.customerName, order.phone].filter(Boolean).join(" · ")}
            />
          ) : null}
        </View>

        <OrderStatusHistory order={order} onStatusChange={handleStatusChange} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items && order.items.length > 0 ? (
            <View style={styles.itemsList}>
              {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.nameSnapshot || item.name}</Text>
                  <Text style={styles.itemQty}>×{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency((item.priceSnapshot ?? item.price) * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No items in this order</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          {order.tax && order.tax > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{formatCurrency(order.tax)}</Text>
            </View>
          )}
          <View style={[styles.totalsRow, styles.totalsTotal]}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Table</Text>
            <Text style={styles.metaValue}>
              {order.tableNumber || order.tableId || "—"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <Text style={styles.metaValue}>
              {order.paymentMethod === "online" ? "Online" : "Cash at Counter"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Payment Status</Text>
            <Badge
              variant={order.paymentStatus === "paid" ? "success" : "warning"}
              size="sm"
            >
              {order.paymentStatus}
            </Badge>
          </View>
        </View>

        {(canAccept || canComplete || canCancel) && (
          <View style={styles.actionsBar}>
            {canAccept && (
              <Button
                variant="outline"
                onPress={() => handleStatusChange("accept")}
                disabled={updatingStatus}
                style={styles.actionBtn}
              >
                Accept
              </Button>
            )}
            {canComplete && (
              <Button
                onPress={() => handleStatusChange("complete")}
                disabled={updatingStatus}
                style={styles.actionBtn}
              >
                Complete
              </Button>
            )}
            {canCancel && (
              <Button
                variant="danger"
                onPress={() => handleStatusChange("cancel")}
                disabled={updatingStatus}
                style={styles.actionBtn}
              >
                Cancel
              </Button>
            )}
            {order.paymentMethod === "cash" && order.paymentStatus !== "paid" && (
              <Button
                variant="secondary"
                onPress={() => handleMarkCashPaid(order.orderId || order._id)}
                disabled={updatingStatus}
                style={styles.actionBtn}
              >
                Mark as Paid
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ label, value, valueStyle }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueWrap}>
        {typeof value === "string" ? (
          <Text style={[styles.detailValue, valueStyle]} numberOfLines={2}>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
    paddingTop: 2,
  },
  detailValueWrap: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: spacing.md,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "right",
  },
  amountValue: {
    color: colors.primary,
    fontWeight: "700",
  },
  productsValue: {
    fontWeight: "500",
    maxWidth: "60%",
  },
  sectionCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  itemQty: {
    fontSize: 13,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  totalsTotal: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalsValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  metaCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  metaItem: {
    flex: 1,
    minWidth: "45%",
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  actionsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flexGrow: 1,
  },
});