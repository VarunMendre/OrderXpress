import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

export default function SummaryCard({ greeting, sub, tiles = [] }) {
  return (
    <View style={styles.card}>
      {greeting ? (
        <View style={styles.greetingRow}>
          <Text style={styles.greeting} numberOfLines={1}>
            {greeting}
            {sub ? <Text style={styles.greetingSub}> · {sub}</Text> : null}
          </Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.label} style={styles.tile}>
            {tile.icon ? (
              <Ionicons name={tile.icon} size={16} color="rgba(255,255,255,0.9)" />
            ) : null}
            <Text style={styles.value} numberOfLines={1}>
              {tile.value}
            </Text>
            <Text style={styles.label} numberOfLines={1}>
              {tile.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: spacing.xl,
    ...PlatformShadow(),
  },
  greetingRow: {
    marginBottom: 14,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  greetingSub: {
    fontWeight: '400',
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
});

function PlatformShadow() {
  return {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  };
}