import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function Input({
  label,
  error,
  multiline = false,
  style,
  inputStyle,
  ...props
}) {
  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.errorInput,
          inputStyle,
        ]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.labelSm,
    color: colors.danger,
  },
  errorInput: {
    borderColor: colors.danger,
  },
});