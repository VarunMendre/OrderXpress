import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { orderApi, menuApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import SummaryCard from '../components/SummaryCard';
import OrderRow from '../components/OrderRow';
import Spinner from '../components/Spinner';
import { colors, spacing, radius, shadows } from '../theme';
import { formatCurrency } from '../utils/format';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function greetingForHour(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function buildWeekSeries(orders) {
  const days = [];
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  for (let i = 0; i < 7; i += 1) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const total = orders
      .filter((o) => {
        if (!o.placedAt) return false;
        const d = new Date(o.placedAt);
        return d >= dayStart && d < dayEnd;
      })
      .filter((o) => ['paid', 'completed'].includes(o.status || o.orderStatus))
      .reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0);
    days.push({ label: WEEKDAYS[dayStart.getDay() === 0 ? 6 : dayStart.getDay() - 1], total });
  }
  return days;
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [orderData, menuData] = await Promise.all([
        orderApi.list({ limit: 100 }),
        menuApi.list(),
      ]);
      setOrders(orderData.items || []);
      setMenuCount(Array.isArray(menuData) ? menuData.length : (menuData.items || []).length);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const restaurantName = user.restaurant?.name || user.onboarding?.restaurantName || 'Restaurant';
  const ownerName = user.admin?.ownerName || 'Chef';

  const todayOrders = orders.filter((o) => {
    if (!o.placedAt) return true;
    return new Date(o.placedAt).toDateString() === new Date().toDateString();
  });

  const pendingCount = orders.filter((o) =>
    ['pending_payment', 'accepted'].includes(o.status || o.orderStatus)
  ).length;

  const revenue = todayOrders
    .filter((o) => ['paid', 'completed'].includes(o.status || o.orderStatus))
    .reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0);

  const tiles = [
    { label: "Today's Orders", value: String(todayOrders.length), icon: 'cart-outline' },
    { label: 'Pending', value: String(pendingCount), icon: 'time-outline' },
    { label: 'Revenue', value: formatCurrency(revenue), icon: 'cash-outline' },
    { label: 'Menu Items', value: String(menuCount), icon: 'restaurant-outline' },
  ];

  const week = buildWeekSeries(orders);
  const chartMax = Math.max(...week.map((d) => d.total), 1);

  const recent = [...orders]
    .sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0))
    .slice(0, 5);

  return (
    <Screen>
      <AppHeader onNotifications={() => {}} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SummaryCard
          greeting={`${greetingForHour(new Date().getHours())}, ${ownerName}`}
          sub={restaurantName}
          tiles={tiles}
        />

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenue Overview</Text>
            <View style={styles.periodPill}>
              <Text style={styles.periodText}>This week</Text>
            </View>
          </View>
          <View style={styles.chartBars}>
            {week.map((d, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${Math.max((d.total / chartMax) * 100, 4)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Pressable onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <Spinner size="large" />
          </View>
        ) : recent.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          <View style={styles.orderList}>
            {recent.map((order, idx) => (
              <OrderRow
                key={order.orderId || order._id}
                order={order}
                index={idx}
                onPress={() =>
                  navigation.navigate('Orders', {
                    screen: 'OrderDetail',
                    params: { orderId: order.orderId || order._id },
                  })
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
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  periodPill: {
    backgroundColor: colors.input,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  periodText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    height: 120,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 6,
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
  seeAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
  },
  orderList: {
    marginBottom: spacing.xl,
  },
});