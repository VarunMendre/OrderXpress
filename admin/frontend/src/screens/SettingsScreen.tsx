import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { TextField } from "../components/TextField";
import { getSettings, saveSettings, type AdminSettingsRecord } from "../services/settingsService";
import { colors, radius, spacing } from "../theme/tokens";

type SettingsScreenProps = {
  onBackToHome: () => void;
};

const emptySettings: AdminSettingsRecord = {
  restaurantName: "",
  tableCount: 0,
  bankAccountName: "",
  bankAccountNumber: "",
  bankIfscCode: "",
  supportEmail: "",
};

export function SettingsScreen({ onBackToHome }: SettingsScreenProps) {
  const [draft, setDraft] = useState<AdminSettingsRecord>(emptySettings);
  const [message, setMessage] = useState("Loading settings...");

  async function loadSettings() {
    const result = await getSettings();
    if (!result.success || !result.data) {
      setMessage(result.message);
      return;
    }

    setDraft(result.data);
    setMessage(result.message);
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async () => {
    const result = await saveSettings(draft);
    setMessage(result.message);
    if (result.success && result.data) {
      setDraft(result.data);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Settings</Text>
        <Text style={styles.title}>Restaurant profile and support details</Text>
        <Text style={styles.subtitle}>
          Keep core restaurant identity and bank information in one place for QR, orders, and payouts.
        </Text>
      </View>

      <SectionCard title="Restaurant Profile" subtitle={message}>
        <View style={styles.form}>
          <TextField
            label="Restaurant Name"
            value={draft.restaurantName}
            onChangeText={(value) => setDraft((current) => ({ ...current, restaurantName: value }))}
          />
          <TextField
            label="Number of Tables"
            value={String(draft.tableCount)}
            keyboardType="number-pad"
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, tableCount: Number(value || 0) }))
            }
          />
          <TextField
            label="Support Email"
            value={draft.supportEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(value) => setDraft((current) => ({ ...current, supportEmail: value }))}
          />
        </View>
      </SectionCard>

      <SectionCard title="Bank Details" subtitle="Used later for payout and collection workflows.">
        <View style={styles.form}>
          <TextField
            label="Account Name"
            value={draft.bankAccountName}
            onChangeText={(value) => setDraft((current) => ({ ...current, bankAccountName: value }))}
          />
          <TextField
            label="Account Number"
            value={draft.bankAccountNumber}
            keyboardType="number-pad"
            onChangeText={(value) => setDraft((current) => ({ ...current, bankAccountNumber: value }))}
          />
          <TextField
            label="IFSC Code"
            value={draft.bankIfscCode}
            autoCapitalize="characters"
            onChangeText={(value) => setDraft((current) => ({ ...current, bankIfscCode: value }))}
          />
        </View>
      </SectionCard>

      <SectionCard title="Password Reset" subtitle="Entry point only for the next auth hardening step.">
        <Text style={styles.note}>
          Password reset flow will be connected after the initial prototype, once auth hardening begins.
        </Text>
      </SectionCard>

      <View style={styles.actionRow}>
        <PrimaryButton label="Save Settings" onPress={() => void handleSave()} />
        <PrimaryButton label="Back to Home" onPress={onBackToHome} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  hero: {
    gap: spacing.xs,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
