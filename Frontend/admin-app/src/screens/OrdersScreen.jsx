import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import { Button, Badge } from '../components';
import Spinner from '../components/Spinner';
import { colors, spacing, radius, typography } from '../theme';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (tableFilter) params.tableId = tableFilter;
      const data = await orderApi.list(params);
      setOrders(data.items || []);
    } catch (e) {
      setError(e.message);
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, action) => {
    try {
      await orderApi.updateStatus(orderId, action);
      fetchOrders();
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleMarkCashPaid = async (orderId) => {
    try {
      await orderApi.markCashPaid(orderId);
      fetchOrders();
    } catch (e) {
      console.error('Failed to mark order as paid:', e);
    }
  };

  if (!user) {
    return null;
  }

  const statusColors = {
    placed: 'secondary',
    accepted: 'primary',
    preparing: 'warning',
    ready: 'primary',
    served: 'success',
    completed: 'success',
    cancelled: 'danger',
  };

  const statusLabels = {
    placed: 'Placed',
    accepted: 'Accepted',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <Screen>
      <AppHeader title="Orders Management" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.selectWrapper}>
                <Text style={styles.selectText}>
                  {statusFilter ? statusLabels[statusFilter] : 'All Statuses'}
                </Text>
              </View>
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Table</Text>
              <View style={styles.selectWrapper}>
                <Text style={styles.selectText}>
                  {tableFilter ? `Table ${tableFilter}` : 'All Tables'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {isLoading && <Spinner size="small" />}
          <Button variant="secondary" onPress={fetchOrders}>
            Refresh
          </Button>
        </View>

        {isLoading && (
          <View style={styles.loadingState}>
            <Spinner size="large" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        )}

        {!isLoading && orders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}

        {!isLoading && orders.length > 0 && (
          <View style={styles.orderList}>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                statusColors={statusColors}
                statusLabels={statusLabels}
                onStatusChange={handleStatusChange}
                onMarkCashPaid={handleMarkCashPaid}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function OrderCard({ order, statusColors, statusLabels, onStatusChange, onMarkCashPaid }) {
  const statusColor = statusColors[order.status] || 'secondary';
  const statusLabel = statusLabels[order.status] || order.status;
  const statusIndex = ['placed', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'].indexOf(order.status);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber || order._id?.slice(-6)}</Text>
          <Badge variant={statusColor} size="sm">{statusLabel}</Badge>
        </View>
        <View style={styles.orderActions}>
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="outline"
              onPress={() => onStatusChange(order._id, 'accept')}
            >
              Accept
            </Button>
          )}
          {order.status === 'accepted' && (
            <Button
              size="sm"
              onPress={() => onStatusChange(order._id, 'complete')}
            >
              Complete
            </Button>
          )}
          {order.status === 'accepted' && (
            <Button
              size="sm"
              variant="danger"
              onPress={() => onStatusChange(order._id, 'cancel')}
            >
              Cancel
            </Button>
          )}
          {order.paymentMethod === 'cash' && order.status !== 'completed' && (
            <Button
              size="sm"
              variant="secondary"
              onPress={() => onMarkCashPaid(order._id)}
            >
              Mark Paid
            </Button>
          )}
        </View>
      </View>
      <View style={styles.orderDetails}>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Table</Text>
          <Text style={styles.orderValue}>{order.table?.tableNumber || '—'}</Text>
        </View>
        {order.items?.length > 0 && (
          <View style={styles.itemsSummary}>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.itemSummary}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.orderTotals}>
          <Text>Subtotal: ₹{order.subtotal || order.totalAmount}</Text>
          {order.tax && order.tax > 0 && <Text>Tax: ₹{order.tax}</Text>}
        </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  selectText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  loadingState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textMuted,
  },
  orderList: {
    gap: spacing.md,
  },
  orderCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderNumber: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  orderLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  orderValue: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  itemsSummary: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  itemSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemName: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderTotals: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});