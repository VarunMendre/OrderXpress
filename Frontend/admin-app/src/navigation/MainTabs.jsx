import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MenuScreen from '../screens/MenuScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: HomeScreen, icon: 'home-outline', iconActive: 'home' },
  { name: 'Orders', component: OrdersScreen, icon: 'receipt-outline', iconActive: 'receipt' },
  { name: 'Menu', component: MenuScreen, icon: 'restaurant-outline', iconActive: 'restaurant' },
  { name: 'Collections', component: CollectionsScreen, icon: 'wallet-outline', iconActive: 'wallet' },
  { name: 'Settings', component: SettingsScreen, icon: 'settings-outline', iconActive: 'settings' },
];

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 2,
        },
      }}
    >
      {TABS.map(({ name, component, icon, iconActive }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? iconActive : icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}