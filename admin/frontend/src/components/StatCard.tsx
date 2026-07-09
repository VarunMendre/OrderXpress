import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});
