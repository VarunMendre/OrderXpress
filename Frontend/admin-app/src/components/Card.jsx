import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

export default function Card({ onPress, style, children, interactive = false }) {
  if (interactive) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.surfaceHover,
  },
});