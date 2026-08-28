import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from './Badge';
import { colors, radius, shadows, spacing } from '../theme';
import {
  avatarColor,
  formatCurrency,
  getInitials,
  orderCustomerName,
  orderNumber,
  orderProductsLine,
  orderStatusInfo,
  timeAgo,
} from '../utils/format';

export default function OrderRow({ order, index = 0, onPress, products }) {
  const statusInfo = orderStatusInfo(order);
  const productsLine = products ?? orderProductsLine(order);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor(index) }]}>
        <Text style={styles.avatarText}>{getInitials(orderCustomerName(order))}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {orderCustomerName(order)}
        </Text>
        <View style={styles.metaLine}>
          <Text style={styles.id}>#{orderNumber(order)}</Text>
          <Badge variant={statusInfo.variant} size="sm">
            {statusInfo.label}
          </Badge>
        </View>
        <Text style={styles.products} numberOfLines={1}>
          {productsLine}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(order.totalAmount ?? order.total)}</Text>
        <Text style={styles.time}>{timeAgo(order.placedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    ...shadows.soft,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  id: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  products: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 10,
    color: colors.textMuted,
  },
});