import React from 'react';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import ScreenPlaceholder from '../components/ScreenPlaceholder';

export default function OrdersScreen() {
  return (
    <Screen>
      <AppHeader />
      <ScreenPlaceholder
        title="Orders"
        icon="receipt-outline"
        description="Live order feed with filters by status, table and time."
      />
    </Screen>
  );
}