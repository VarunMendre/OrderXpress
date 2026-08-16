import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export default function Toggle({ value = false, onValueChange, disabled = false }) {
  return (
    <Pressable
      onPress={() => onValueChange && onValueChange(!value)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.track,
        value && styles.trackOn,
        pressed && styles.pressed,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.accent,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  pressed: {
    opacity: 0.85,
  },
});