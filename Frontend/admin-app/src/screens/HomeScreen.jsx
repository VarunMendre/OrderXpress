import React from 'react';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import ScreenPlaceholder from '../components/ScreenPlaceholder';

export default function HomeScreen() {
  return (
    <Screen>
      <AppHeader />
      <ScreenPlaceholder
        title="Dashboard"
        icon="grid-outline"
        description="Restaurant overview, stats and recent orders will live here."
      />
    </Screen>
  );
}