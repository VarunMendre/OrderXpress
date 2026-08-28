import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/SummaryCard';
import OrderRow from '../components/OrderRow';
import { Button } from '../components';
import Spinner from '../components/Spinner';
import { colors, spacing } from '../theme';
import { formatCurrency } from '../utils/format';

export default function CollectionsScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.list({ limit: 100 });
      setOrders(data.items || []);
    } catch (e) {
      setError(e.message);
      console.error('Failed to fetch collections:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const isPaid = (order) => {
    const status = order.status || order.orderStatus;
    return ['paid', 'completed'].includes(status) || order.paymentStatus === 'paid';
  };

  const totalCollected = orders
    .filter(isPaid)
    .reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0);

  const pendingAmount = orders
    .filter((o) => !isPaid(o) && (o.status || o.orderStatus) !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0);

  const cashOrders = orders.filter((o) => o.paymentMethod === 'cash');
  const onlineOrders = orders.filter((o) => o.paymentMethod === 'online');

  const tiles = [
    { label: 'Total Collected', value: formatCurrency(totalCollected), icon: 'wallet-outline' },
    { label: 'Pending', value: formatCurrency(pendingAmount), icon: 'time-outline' },
    { label: 'Cash Orders', value: String(cashOrders.length), icon: 'cash-outline' },
    { label: 'Online Orders', value: String(onlineOrders.length), icon: 'phone-portrait-outline' },
  ];

  const sorted = [...orders].sort(
    (a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0)
  );

  return (
    <Screen>
      <AppHeader onNotifications={() => {}} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SummaryCard tiles={tiles} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <Button variant="secondary" size="sm" onPress={fetchCollections}>
            Refresh
          </Button>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <Spinner size="large" />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button variant="secondary" onPress={fetchCollections}>
              Retry
            </Button>
          </View>
        ) : sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          <View style={styles.orderList}>
            {sorted.map((order, idx) => (
              <OrderRow
                key={order.orderId || order._id}
                order={order}
                index={idx}
                products={`${order.paymentMethod === 'online' ? 'Online' : 'Cash'} · ${order.paymentStatus || (isPaid(order) ? 'Paid' : 'Unpaid')}`}
              />
            ))}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  loadingState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
  },
  orderList: {
    marginBottom: spacing.xl,
  },
});