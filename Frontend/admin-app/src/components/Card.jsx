import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

export default function Card({ onPress, style, children, interactive = false }) {
  const Wrapper = interactive ? Pressable : View;
  const wrapperProps = interactive ? { onPress } : {};
  return (
    <Wrapper
      {...wrapperProps}
      style={({ pressed }) => [
        styles.card,
        interactive && pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
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