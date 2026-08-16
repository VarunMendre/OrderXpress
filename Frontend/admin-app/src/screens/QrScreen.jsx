import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { tableApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import { Button, Input, Badge } from '../components';
import Spinner from '../components/Spinner';
import { colors, spacing, radius, typography } from '../theme';

export default function QrScreen({ navigation }) {
  const { user } = useAuth();
  const [tableCount, setTableCount] = useState(2);
  const [tables, setTables] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTables();
    }
  }, [user]);

  const fetchTables = async () => {
    try {
      const data = await tableApi.list();
      setTables(data || []);
    } catch (e) {
      setError(e.message);
      console.error('Failed to fetch tables:', e);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await tableApi.generate({ tableCount });
      setTables(data || []);
    } catch (e) {
      setError(e.message);
      console.error('Failed to generate tables:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <AppHeader title="QR Code Generation" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate Table QR Codes</Text>
          <View style={styles.formGroup}>
            <Input
              type="number"
              value={String(tableCount)}
              onChangeText={(value) => {
                const num = Number(value);
                if (!isNaN(num)) setTableCount(Math.max(1, Math.min(50, num)));
              }}
              placeholder="Number of tables"
              label="Table Count"
              keyboardType="numeric"
            />
          </View>
          <Button
            onPress={handleGenerate}
            disabled={isGenerating}
            style={styles.generateButton}
          >
            {isGenerating ? 'Generating...' : 'Generate QR Codes'}
          </Button>
        </View>

        {isGenerating && (
          <View style={styles.generatingState}>
            <Spinner size="large" />
            <Text style={styles.generatingText}>Generating QR codes for {tableCount} table(s)...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {tables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated QR Codes ({tables.length})</Text>
            <View style={styles.qrList}>
              {tables.map((table) => (
                <QrCard
                  key={table._id}
                  table={table}
                  navigation={navigation}
                />
              ))}
            </View>
          </View>
        )}

        {tables.length === 0 && !isGenerating && (
          <View style={styles.noQrs}>
            <Text style={styles.noQrsText}>No tables generated yet.</Text>
            <Button onPress={handleGenerate}>Generate Tables</Button>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function QrCard({ table, navigation }) {
  const signature = table.qr?.signature || '—';
  const payload = table.qr?.payload || '—';

  return (
    <View style={styles.qrCard}>
      <View style={styles.qrCardHeader}>
        <Text style={styles.qrTableNumber}>Table {table.tableNumber}</Text>
        <Badge variant="secondary" size="sm">Active</Badge>
      </View>
      <View style={styles.qrCardPayload}>
        <Text style={styles.payloadTitle}>Payload:</Text>
        <Text style={styles.payloadText}>{payload}</Text>
        <Text style={styles.payloadMeta}>Signature: {signature}</Text>
      </View>
      <View style={styles.qrCardActions}>
        <Button
          variant="secondary"
          onPress={() => navigation.navigate('OrderDetail', { tableId: table._id })}
        >
          View QR
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  generateButton: {
    width: '100%',
  },
  generatingState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  generatingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  errorBanner: {
    padding: spacing.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  qrList: {
    gap: spacing.md,
  },
  qrCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  qrCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrTableNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  qrCardPayload: {
    marginBottom: spacing.md,
  },
  payloadTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  payloadText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  payloadMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  qrCardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noQrs: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  noQrsText: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});