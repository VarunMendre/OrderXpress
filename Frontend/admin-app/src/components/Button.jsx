import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export default function Button({
  title,
  children,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon: Icon,
  iconName,
  iconSize = 18,
}) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";
  const isDisabled = disabled || loading;
  const label = title ?? children;
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  const textColor = isPrimary || isDanger
    ? (isDanger ? colors.danger : colors.white)
    : isOutline
      ? colors.primary
      : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isSmall && styles.small,
        isLarge && styles.large,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isDanger && styles.danger,
        isGhost && styles.ghost,
        (pressed || isDisabled) && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {Icon && (
            <Icon
              name={iconName}
              size={iconSize}
              color={isPrimary ? colors.white : colors.accent}
            />
          )}
          <Text
            style={[styles.text, isSmall && styles.textSmall, { color: textColor }, textStyle]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.xs,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  danger: {
    backgroundColor: colors.dangerTint,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: { opacity: 0.85 },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  textSmall: {
    fontSize: 12,
  },
});