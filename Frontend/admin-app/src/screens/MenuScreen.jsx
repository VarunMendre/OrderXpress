import React from 'react';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import ScreenPlaceholder from '../components/ScreenPlaceholder';

export default function MenuScreen() {
  return (
    <Screen>
      <AppHeader />
      <ScreenPlaceholder
        title="Menu"
        icon="restaurant-outline"
        description="Menu upload, extraction review and item CRUD will live here."
      />
    </Screen>
  );
}