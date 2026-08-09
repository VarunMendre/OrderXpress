import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme';

const VARIANTS = {
  info: {
    bg: colors.primaryTint,
    text: colors.primary,
  },
  warning: {
    bg: colors.warningTint,
    text: colors.warning,
  },
  danger: {
    bg: colors.dangerTint,
    text: colors.danger,
  },
  neutral: {
    bg: colors.surfaceHover,
    text: colors.textSecondary,
  },
};

export default function Badge({ label, variant = 'neutral', dot = false, style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: v.text }]} />}
      <Text style={[styles.label, { color: v.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...typography.labelSm,
    fontWeight: '600',
  },
});