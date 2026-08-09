import React from 'react';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import ScreenPlaceholder from '../components/ScreenPlaceholder';

export default function CollectionsScreen() {
  return (
    <Screen>
      <AppHeader />
      <ScreenPlaceholder
        title="Collections"
        icon="wallet-outline"
        description="Daily and date-wise sales collections will live here."
      />
    </Screen>
  );
}