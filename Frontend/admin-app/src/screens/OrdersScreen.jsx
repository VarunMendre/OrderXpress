import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import PageHeader from '../components/PageHeader';
import OrderRow from '../components/OrderRow';
import { Button } from '../components';
import Spinner from '../components/Spinner';
import { colors, spacing, radius, shadows } from '../theme';

const FILTER_TABS = [
  { key: '', label: 'All' },
  { key: 'pending_payment', label: 'New' },
  { key: 'accepted', label: 'Processing' },
  { key: 'paid', label: 'Paid' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { status: statusFilter || undefined, limit: 50 };
      const data = await orderApi.list(params);
      setOrders(data.items || []);
    } catch (e) {
      setError(e.message);
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const q = searchQuery.trim().toLowerCase();
  const visibleOrders = q
    ? orders.filter((o) =>
        `${o.orderNumber || o.orderId || o.customerName || ''}`
          .toLowerCase()
          .includes(q)
      )
    : orders;

  return (
    <Screen>
      <AppHeader onNotifications={() => {}} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <PageHeader
          title="Orders"
          sub={`${visibleOrders.length} orders`}
        />

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsRow}
        >
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key || 'all'}
              style={[styles.tab, statusFilter === tab.key && styles.tabActive]}
              onPress={() => setStatusFilter(tab.key)}
            >
              <Text style={[styles.tabLabel, statusFilter === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingState}>
            <Spinner size="large" />
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button variant="secondary" onPress={fetchOrders}>
              Retry
            </Button>
          </View>
        )}

        {!isLoading && !error && visibleOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        )}

        {!isLoading && !error && visibleOrders.length > 0 && (
          <View style={styles.orderList}>
            {visibleOrders.map((order, idx) => (
              <OrderRow
                key={order.orderId || order._id}
                order={order}
                index={idx}
                onPress={() =>
                  navigation.navigate('OrderDetail', { orderId: order.orderId || order._id })
                }
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  tabsScroll: {
    flexGrow: 0,
    marginBottom: 14,
  },
  tabsRow: {
    gap: 6,
    paddingRight: spacing.md,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.white,
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