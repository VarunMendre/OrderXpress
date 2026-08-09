import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const admin = user?.admin;
  const restaurant = user?.restaurant;

  const initials = admin?.ownerName
    ? admin.ownerName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  return (
    <Screen>
      <AppHeader />
      <Text style={styles.pageTitle}>Settings</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{admin?.ownerName || 'Restaurant Admin'}</Text>
          <Text style={styles.profileMeta}>
            {restaurant?.name || 'Restaurant'}
            {restaurant?.cuisineType ? ` · ${restaurant.cuisineType}` : ''}
          </Text>
          <Text style={styles.profileMeta}>{admin?.email}</Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Account</Text>
        <Pressable style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
          <View style={[styles.itemIcon, styles.iconWallet]}>
            <Ionicons name="storefront-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Restaurant Profile</Text>
            <Text style={styles.itemSub}>Coming in Chunk 11</Text>
          </View>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
          <View style={[styles.itemIcon, styles.iconNavy]}>
            <Ionicons name="qr-code-outline" size={18} color={colors.navy} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Tables & QR</Text>
            <Text style={styles.itemSub}>{restaurant?.tableCount ?? '-'} tables configured</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Session</Text>
        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={logout}
        >
          <View style={[styles.iconBase, styles.iconDanger]}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Log out</Text>
            <Text style={styles.itemSub}>End this session on this device</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    ...typography.headline,
    marginTop: 4,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    ...shadows.soft,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    ...typography.title,
  },
  profileMeta: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  group: {
    marginBottom: 20,
  },
  groupTitle: {
    ...typography.labelSm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 6,
    ...shadows.soft,
  },
  itemPressed: {
    backgroundColor: colors.surfaceHover,
  },
  iconBase: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWallet: {
    backgroundColor: colors.primaryTint,
  },
  iconNavy: {
    backgroundColor: colors.navyTint,
  },
  iconDanger: {
    backgroundColor: colors.dangerTint,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.title,
    fontSize: 13,
  },
  itemSub: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
});
