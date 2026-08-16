import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, typography } from "../theme";

const VARIANTS = {
  info: {
    bg: colors.primaryTint,
    text: colors.primary,
  },
  primary: {
    bg: colors.primaryTint,
    text: colors.primary,
  },
  success: {
    bg: colors.successTint,
    text: colors.success,
  },
  warning: {
    bg: colors.warningTint,
    text: colors.warning,
  },
  danger: {
    bg: colors.dangerTint,
    text: colors.danger,
  },
  secondary: {
    bg: colors.surfaceHover,
    text: colors.textSecondary,
  },
  neutral: {
    bg: colors.surfaceHover,
    text: colors.textSecondary,
  },
};

export default function Badge({
  label,
  children,
  variant = "neutral",
  dot = false,
  size = "md",
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const content = label ?? children;
  const isSmall = size === "sm";
  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSm,
        { backgroundColor: v.bg },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: v.text }]} />}
      <Text
        style={[styles.label, isSmall && styles.labelSm, { color: v.text }]}
        numberOfLines={1}
      >
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...typography.labelSm,
    fontWeight: "600",
  },
  labelSm: {
    fontSize: 10,
  },
});
