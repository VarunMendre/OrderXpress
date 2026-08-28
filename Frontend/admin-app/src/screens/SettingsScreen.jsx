import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Toggle from '../components/Toggle';
import { colors, spacing, radius, typography } from '../theme';
import { getInitials } from '../utils/format';

const THEME_KEY = 'ox-admin-theme';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailReports, setEmailReports] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => setDarkMode(v === 'dark'))
      .catch(() => {});
  }, []);

  const ownerName = user?.admin?.ownerName || 'Restaurant Owner';
  const restaurantName = user?.restaurant?.name || user?.onboarding?.restaurantName || 'Your Restaurant';

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light').catch(() => {});
    Alert.alert('Dark Mode', 'Dark mode will be available in a future update.');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <AppHeader onNotifications={() => {}} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Pressable
          style={({ pressed }) => [styles.profileCard, pressed && styles.pressed]}
          onPress={() => Alert.alert(ownerName, `${restaurantName}\nAdministrator`)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(ownerName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{ownerName}</Text>
            <View style={styles.profileSubRow}>
              <Text style={styles.profileSub}>Administrator</Text>
              <View style={styles.statusDot} />
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Preferences</Text>
          <SettingsItem
            icon="time-outline"
            variant="purple"
            title="Dark Mode"
            subtitle={darkMode ? 'On' : 'Off'}
            right={<Toggle value={darkMode} onValueChange={toggleDarkMode} />}
          />
          <SettingsItem
            icon="notifications-outline"
            variant="teal"
            title="Push Notifications"
            subtitle="New orders, updates"
            right={<Toggle value={pushEnabled} onValueChange={setPushEnabled} />}
          />
          <SettingsItem
            icon="mail-outline"
            variant="amber"
            title="Email Reports"
            subtitle="Daily summary"
            right={<Toggle value={emailReports} onValueChange={setEmailReports} />}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Store</Text>
          <SettingsItem
            icon="people-outline"
            variant="purple"
            title="Staff Management"
            subtitle={`${restaurantName}`}
            onPress={() => Alert.alert('Staff Management', 'Manage your team and roles.')}
          />
          <SettingsItem
            icon="card-outline"
            variant="teal"
            title="Payment Methods"
            subtitle="Razorpay, Cash at Counter"
            onPress={() => Alert.alert('Payment Methods', 'Online payments are configured in the backend.')}
          />
          <SettingsItem
            icon="restaurant-outline"
            variant="amber"
            title="Qr Codes"
            subtitle="Table QR codes"
            onPress={() => navigation.navigate('Menu', { screen: 'Qr' })}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Support</Text>
          <SettingsItem
            icon="help-circle-outline"
            variant="red"
            title="Help & Support"
            subtitle="FAQ, contact, docs"
            onPress={() => Alert.alert('Help & Support', 'Contact support for assistance with OrderXpress.')}
          />
          <SettingsItem
            icon="information-circle-outline"
            variant="purple"
            title="About"
            subtitle="Version 2.4.1"
            onPress={() => Alert.alert('About', 'OrderXpress Admin\nRestaurant order management made simple.')}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Account</Text>
          <SettingsItem
            icon="log-out-outline"
            variant="red"
            title="Log Out"
            subtitle="Sign out of this device"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const ICON_VARIANTS = {
  purple: { bg: colors.accentGlow, color: colors.accentLight },
  teal: { bg: colors.primaryTint, color: colors.primary },
  amber: { bg: colors.warningTint, color: colors.warning },
  red: { bg: colors.dangerTint, color: colors.danger },
};

function SettingsItem({ icon, variant = 'purple', title, subtitle, onPress, right }) {
  const v = ICON_VARIANTS[variant] || ICON_VARIANTS.purple;
  const Wrapper = onPress ? Pressable : View;
  const wrapperProps = onPress
    ? { onPress, style: ({ pressed }) => [styles.item, pressed && styles.itemPressed] }
    : { style: styles.item };

  return (
    <Wrapper {...wrapperProps}>
      <View style={[styles.itemIcon, { backgroundColor: v.bg }]}>
        <Ionicons name={icon} size={18} color={v.color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      {right || (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  profileSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginLeft: 6,
    alignSelf: 'center',
  },
  group: {
    marginBottom: spacing.xl,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  itemPressed: {
    backgroundColor: colors.surfaceHover,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
});