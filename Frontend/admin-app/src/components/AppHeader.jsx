import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';
import { getInitials } from '../utils/format';

export default function AppHeader({ onBack, onNotifications }) {
  const { user } = useAuth();
  const ownerName = user?.admin?.ownerName || 'Chef';

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable style={styles.headerBtn} onPress={onBack} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <View style={styles.logo}>
            <Text style={styles.logoText}>OX</Text>
          </View>
        )}
        <Text style={styles.title}>
          Order<Text style={styles.titleSub}>Xpress</Text>
        </Text>
      </View>
      <View style={styles.right}>
        <Pressable style={styles.headerBtn} onPress={onNotifications} accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
          <View style={styles.notifDot} />
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(ownerName)}</Text>
        </View>
      </View>
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
    backgroundColor: colors.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
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
    color: colors.textPrimary,
  },
  titleSub: {
    color: colors.textMuted,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...PlatformShadow(),
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
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

function PlatformShadow() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  };
}