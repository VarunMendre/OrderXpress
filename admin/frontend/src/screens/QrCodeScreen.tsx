import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { TextField } from "../components/TextField";
import { createQrSession } from "../services/qrService";
import { colors, spacing } from "../theme/tokens";

type QrCodeScreenProps = {
  restaurantName: string;
  restaurantId: string;
  onBackToHome: () => void;
};

export function QrCodeScreen({
  restaurantName,
  restaurantId,
  onBackToHome,
}: QrCodeScreenProps) {
  const [tableNumber, setTableNumber] = useState("1");
  const [duration, setDuration] = useState("720");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const tableLabel = useMemo(() => `Table ${tableNumber || "1"}`, [tableNumber]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    const result = await createQrSession({
      restaurantId,
      restaurantName,
      tableNumber: Number(tableNumber || 1),
      sessionDurationMinutes: Number(duration || 720),
    });

    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.message);
      return;
    }

    setPayload(result.data.payload);
    setQrCodeDataUrl(result.data.qrCodeDataUrl);
    setExpiresAt(result.data.expiresAt);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>QR Code Generation</Text>
        <Text style={styles.title}>{restaurantName || "Your Restaurant"}</Text>
        <Text style={styles.subtitle}>
          Generate a signed QR for each table so guests can view the menu
          without exposing any write access.
        </Text>
      </View>

      <SectionCard
        title="Create QR Session"
        subtitle="Each QR stores table identity plus signed metadata."
      >
        <View style={styles.form}>
          <TextField
            label="Table Number"
            placeholder="1"
            keyboardType="number-pad"
            value={tableNumber}
            onChangeText={setTableNumber}
          />
          <TextField
            label="Session Duration (minutes)"
            placeholder="720"
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />
          <PrimaryButton
            label={loading ? "Generating..." : `Generate ${tableLabel} QR`}
            onPress={handleGenerate}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </SectionCard>

      {qrCodeDataUrl ? (
        <SectionCard
          title="Printable QR"
          subtitle="This preview can be shared or printed for the selected table."
        >
          <View style={styles.preview}>
            <Image source={{ uri: qrCodeDataUrl }} style={styles.qrImage} />
            <Text style={styles.previewLabel}>{tableLabel}</Text>
            {expiresAt ? <Text style={styles.meta}>Expires: {expiresAt}</Text> : null}
          </View>
        </SectionCard>
      ) : null}

      {payload ? (
        <SectionCard title="Signed Payload" subtitle="Useful for debugging and future customer app routing.">
          <Text style={styles.payload}>{payload}</Text>
        </SectionCard>
      ) : null}

      <PrimaryButton label="Back to Home" onPress={onBackToHome} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
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
  preview: {
    alignItems: "center",
    gap: spacing.sm,
  },
  qrImage: {
    width: 240,
    height: 240,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  previewLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  payload: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: "#B42318",
    fontSize: 13,
    lineHeight: 18,
  },
});

