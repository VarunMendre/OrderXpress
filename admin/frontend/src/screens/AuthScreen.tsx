import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { submitAuthRequest } from "../services/authService";
import { colors, radius, spacing } from "../theme/tokens";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  onAuthenticated: (restaurantName: string, restaurantId: string, sessionToken: string) => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length >= 8 &&
    (mode === "login" || restaurantName.trim().length > 0) &&
    !isSubmitting;

  async function handleSubmit() {
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await submitAuthRequest({
        mode,
        email,
        password,
        restaurantName: mode === "register" ? restaurantName : undefined,
      });

      if (!response.success) {
        setStatusMessage(response.message);
        return;
      }

      const targetName =
        response.data?.restaurantName ?? (restaurantName.trim() || "your restaurant");

      setStatusMessage(
        mode === "login"
          ? `Signed in as ${response.data?.email}.`
          : `Created ${targetName} successfully.`,
      );
      onAuthenticated(
        response.data?.restaurantName ?? targetName,
        response.data?.restaurantId ?? "",
        response.data?.sessionToken ?? "",
      );
      Alert.alert("OrderXpress", response.message);
    } catch {
      setStatusMessage("Unable to connect to the backend right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.brand}>OrderXpress Admin</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Sign in to your restaurant" : "Create your restaurant account"}
        </Text>
        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Use your email and password to access menu, orders, and collections."
            : "Set up your restaurant profile before publishing QR codes and menus."}
        </Text>
      </View>

      <View style={styles.form}>
        {mode === "register" ? (
          <TextField
            label="Restaurant Name"
            placeholder="Example Bistro"
            value={restaurantName}
            onChangeText={setRestaurantName}
          />
        ) : null}

        <TextField
          label="Email"
          placeholder="owner@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextField
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <PrimaryButton
          disabled={!canSubmit}
          label={isSubmitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          onPress={handleSubmit}
        />
      </View>

      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {mode === "login" ? "Need a new restaurant account?" : "Already have an account?"}
        </Text>
        <Text
          accessibilityRole="button"
          onPress={() => setMode(mode === "login" ? "register" : "login")}
          style={styles.switchAction}
        >
          {mode === "login" ? "Create one" : "Sign in"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
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
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  switchAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  status: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
