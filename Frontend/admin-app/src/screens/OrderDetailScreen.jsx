import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/admin";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { Button, Badge } from "../components";
import Spinner from "../components/Spinner";
import OrderStatusHistory from "../components/OrderStatusHistory";
import { colors, spacing, radius, typography } from "../theme";

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
    if (!order || !updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await orderApi.updateStatus(order._id, action);
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
        <AppHeader title="Order Detail" />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }

  if (error && !order) {
    return (
      <Screen>
        <AppHeader title="Order Detail" />
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
        <AppHeader title="Order Detail" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
          <Button onPress={() => navigation.goBack()}>Back to Orders</Button>
        </View>
      </Screen>
    );
  }

  const statusIndex = [
    "placed",
    "accepted",
    "preparing",
    "ready",
    "served",
    "completed",
    "cancelled",
  ].indexOf(order.status);
  const canAccept = statusIndex >= 0 && statusIndex < 4;
  const canComplete = statusIndex >= 1 && statusIndex < 5;
  const canCancel = statusIndex >= 0 && statusIndex < 6;

  return (
    <Screen>
      <AppHeader
        title={`Order #${order.orderNumber || order._id?.slice(-6)}`}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <View style={styles.orderMeta}>
              <Text style={styles.metaText}>
                Order Number: #{order.orderNumber || order._id?.slice(-6)}
              </Text>
              <Text style={styles.metaText}>
                Placed: {new Date(order.placedAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.orderCustomer}>
              <Text style={styles.metaText}>
                Customer: {order.customerName || "—"}
              </Text>
              <Text style={styles.metaText}>Phone: {order.phone || "—"}</Text>
            </View>
            {order.specialInstructions && (
              <Text style={styles.specialInstructions}>
                <Text style={styles.specialLabel}>Special Instructions:</Text>{" "}
                {order.specialInstructions}
              </Text>
            )}
          </View>
          <View style={styles.headerBadge}>
            <Badge variant="primary" size="lg">
              {order.status}
            </Badge>
          </View>
        </View>

        <OrderStatusHistory order={order} onStatusChange={handleStatusChange} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items && order.items.length > 0 ? (
            <View style={styles.itemsList}>
              {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>×{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
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
            <Text style={styles.totalsValue}>
              ₹{order.subtotal || order.totalAmount}
            </Text>
          </View>
          {order.tax && order.tax > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>₹{order.tax}</Text>
            </View>
          )}
          {order.serviceCharge && order.serviceCharge > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Service Charge</Text>
              <Text style={styles.totalsValue}>₹{order.serviceCharge}</Text>
            </View>
          )}
          <View style={[styles.totalsRow, styles.totalsTotal]}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Table</Text>
            <Text style={styles.metaValue}>
              {order.table?.tableNumber || "—"}
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
          {order.serverDate && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Served At</Text>
              <Text style={styles.metaValue}>
                {new Date(order.serverDate).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {(canAccept || canComplete || canCancel) && (
          <View style={styles.actionsBar}>
            {canAccept && (
              <Button
                variant="outline"
                onPress={() => handleStatusChange("accept")}
                disabled={updatingStatus}
              >
                Accept
              </Button>
            )}
            {canComplete && order.status === "accepted" && (
              <Button
                onPress={() => handleStatusChange("complete")}
                disabled={updatingStatus}
              >
                Complete
              </Button>
            )}
            {canCancel &&
              order.status !== "completed" &&
              order.status !== "cancelled" && (
                <Button
                  variant="danger"
                  onPress={() => handleStatusChange("cancel")}
                  disabled={updatingStatus}
                >
                  Cancel
                </Button>
              )}
            {order.paymentMethod === "cash" && order.status !== "completed" && (
              <Button
                variant="secondary"
                onPress={() => handleMarkCashPaid(order._id)}
                disabled={updatingStatus}
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
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
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  orderMeta: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  orderCustomer: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  specialInstructions: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  specialLabel: {
    fontWeight: "600",
  },
  headerBadge: {
    alignSelf: "flex-start",
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
    borderBottomWidth: 1,
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
    borderTopWidth: 1,
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
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
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
  },
});
