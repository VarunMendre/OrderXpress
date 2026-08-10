import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon: Icon,
  iconName,
  iconSize = 18,
}) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        (pressed || isDisabled) && (isPrimary ? styles.pressedPrimary : styles.pressedSecondary),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.white : colors.textPrimary}
          size="small"
        />
      ) : (
        <>
          {Icon && <Icon name={iconProps} size={iconSize} color={isPrimary ? colors.white : colors.accent} />}
          <Text style={[styles.text, isPrimary ? styles.textPrimaryBtn : styles.textSecondary, textStyle]}>
            {title}
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressedPrimary: { opacity: 0.85 },
  pressedSecondary: { backgroundColor: colors.surfaceHover },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  textPrimaryBtn: { color: colors.white },
  textSecondary: { color: colors.textPrimary },
});