import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function OrderStatusHistory({ order }) {
  const STATUS_ORDER = ['pending_payment', 'accepted', 'paid', 'completed'];
  const currentIndex = STATUS_ORDER.indexOf(order.orderStatus);

  const STATUS_LABELS = {
    pending_payment: 'Placed',
    accepted: 'Accepted',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Status History</Text>
      <View style={styles.timeline}>
        {STATUS_ORDER.map((status, idx) => {
          const isCurrent = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          const label = STATUS_LABELS[status] || status;
          return (
            <View key={status} style={styles.statusItem}>
              <View style={[
                styles.statusDot,
                isCompleted && styles.statusDotCompleted,
                isCurrent && styles.statusDotCurrent,
              ]} />
              <View style={styles.statusLineContainer}>
                {idx < STATUS_ORDER.length - 1 && (
                  <View style={[
                    styles.statusLine,
                    isCompleted && styles.statusLineCompleted,
                  ]} />
                )}
              </View>
              <Text style={[
                styles.statusLabel,
                isCurrent && styles.statusLabelCurrent,
                isCompleted && styles.statusLabelCompleted,
              ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  timeline: {
    flexDirection: 'row',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  statusDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  statusDotCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusLineContainer: {
    position: 'absolute',
    top: 6,
    left: '50%',
    right: '-50%',
    height: 0,
  },
  statusLine: {
    height: 2,
    backgroundColor: colors.border,
  },
  statusLineCompleted: {
    backgroundColor: colors.success,
  },
  statusLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  statusLabelCurrent: {
    color: colors.primary,
    fontWeight: '500',
  },
  statusLabelCompleted: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});