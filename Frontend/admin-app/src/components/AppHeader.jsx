import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export default function AppHeader({ title, subtitle = 'Xpress' }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>OX</Text>
        </View>
        <Text style={styles.title}>
          {title}
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Text>
      </View>
      <Pressable style={styles.headerBtn} accessibilityLabel="Notifications">
        <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
        <View style={styles.notifDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: colors.white,
  },
  title: {
    ...typography.subtitle,
    fontSize: 18,
  },
  titleAccent: {
    color: colors.textMuted,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowsSoft(),
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});

function shadowsSoft() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  };
}