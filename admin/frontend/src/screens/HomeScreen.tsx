import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { TextField } from "../components/TextField";
import { colors, spacing } from "../theme/tokens";

type HomeScreenProps = {
  restaurantName: string;
  onOpenMenuExtraction: () => void;
  onOpenQrGeneration: () => void;
  onOpenOrdersList: () => void;
  onOpenCollections: () => void;
  onOpenSettings: () => void;
};

export function HomeScreen({
  restaurantName,
  onOpenMenuExtraction,
  onOpenQrGeneration,
  onOpenOrdersList,
  onOpenCollections,
  onOpenSettings,
}: HomeScreenProps) {
  const [displayName, setDisplayName] = useState(restaurantName);
  const [location, setLocation] = useState("Downtown");
  const [tableCount, setTableCount] = useState("12");

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Admin Home</Text>
        <Text style={styles.title}>{displayName || "Your Restaurant"}</Text>
        <Text style={styles.subtitle}>
          Set up your restaurant details, table count, and menu entry point
          before moving to QR generation.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Tables" value={tableCount || "0"} hint="Configured table slots" />
        <StatCard label="Orders" value="0" hint="Awaiting first customer order" />
      </View>

      <SectionCard
        title="Restaurant Setup"
        subtitle="Keep these details accurate so QR codes and orders stay in sync."
      >
        <View style={styles.form}>
          <TextField
            label="Restaurant Name"
            placeholder="Enter restaurant name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextField
            label="Location"
            placeholder="Restaurant location"
            value={location}
            onChangeText={setLocation}
          />
          <TextField
            label="Number of Tables"
            placeholder="12"
            keyboardType="number-pad"
            value={tableCount}
            onChangeText={setTableCount}
          />
          <PrimaryButton
            label="Save Setup"
            onPress={() => {
              // Persisting setup will connect to the backend service next.
            }}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Next Step"
        subtitle="Once setup is saved, menu upload and extraction becomes available."
      >
        <View style={styles.nextStep}>
          <Text style={styles.nextStepText}>
            Upload a clear photo of your menu card to start structured extraction.
          </Text>
          <PrimaryButton
            label="Upload Menu Card"
            onPress={onOpenMenuExtraction}
          />
          <PrimaryButton
            label="Generate QR Code"
            onPress={onOpenQrGeneration}
          />
          <PrimaryButton
            label="View Orders"
            onPress={onOpenOrdersList}
          />
          <PrimaryButton
            label="View Collections"
            onPress={onOpenCollections}
          />
          <PrimaryButton
            label="Settings"
            onPress={onOpenSettings}
          />
        </View>
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  nextStep: {
    gap: spacing.md,
  },
  nextStepText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
