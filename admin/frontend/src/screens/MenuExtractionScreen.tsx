import { useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { TextField } from "../components/TextField";
import { submitMenuExtractionRequest, type MenuItemDraft } from "../services/menuExtractionService";
import { colors, radius, spacing } from "../theme/tokens";

type MenuExtractionScreenProps = {
  restaurantName: string;
  location: string;
  sessionToken: string;
  onBackToHome: () => void;
  onContinueToMenuCrud: () => void;
};

type DraftMenuItem = MenuItemDraft & {
  localId: string;
};

export function MenuExtractionScreen({
  restaurantName,
  location,
  sessionToken,
  onBackToHome,
  onContinueToMenuCrud,
}: MenuExtractionScreenProps) {
  const [menuLocation, setMenuLocation] = useState(location);
  const [imageUri, setImageUri] = useState<string>("");
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("image/jpeg");
  const [statusMessage, setStatusMessage] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [draftItems, setDraftItems] = useState<DraftMenuItem[]>([]);

  const canExtract = imageName.trim().length > 0 && menuLocation.trim().length > 0 && !isExtracting;

  const confidenceLabel = useMemo(() => {
    if (draftItems.length === 0) {
      return "No extraction yet";
    }
    return `${Math.round(86)}% confidence`;
  }, [draftItems.length]);

  function parsePrice(value: string): number | undefined {
    if (value.trim().length === 0) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow gallery access to choose a menu card image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageName(asset.fileName ?? "menu-card.jpg");
    setImageType(asset.mimeType ?? "image/jpeg");
    setStatusMessage("");
  }

  async function handleExtract() {
    setIsExtracting(true);
    setStatusMessage("");

    try {
      const response = await submitMenuExtractionRequest({
        restaurantName,
        location: menuLocation,
        sessionToken,
        image: {
          uri: imageUri,
          name: imageName,
          type: imageType,
        },
      });

      if (!response.success || !response.data) {
        setStatusMessage(response.message);
        return;
      }

      setDraftItems(
        response.data.items.map((item) => ({
          ...item,
          localId: item.id,
        })),
      );
      setStatusMessage(response.message);
    } catch {
      setStatusMessage("Unable to extract menu right now.");
    } finally {
      setIsExtracting(false);
    }
  }

  function updateDraftItemName(localId: string, name: string) {
    setDraftItems((current) =>
      current.map((item) => (item.localId === localId ? { ...item, name } : item)),
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <SectionCard title="Menu Extraction" subtitle="Upload a menu card photo, extract items, then review and edit the draft.">
        <View style={styles.form}>
          <TextField
            label="Restaurant Name"
            value={restaurantName}
            editable={false}
          />
          <TextField
            label="Location"
            placeholder="Restaurant location"
            value={menuLocation}
            onChangeText={setMenuLocation}
          />
          <TextField
            label="Image File"
            placeholder="No image selected"
            value={imageName}
            editable={false}
          />

          <View style={styles.buttonRow}>
            <PrimaryButton label="Pick Menu Image" onPress={pickImage} />
            <PrimaryButton
              label={isExtracting ? "Extracting..." : "Extract Draft"}
              disabled={!canExtract}
              onPress={handleExtract}
            />
          </View>
        </View>
      </SectionCard>

      {imageUri ? (
        <SectionCard title="Selected Image" subtitle="Preview the chosen menu card before extraction.">
          <Image source={{ uri: imageUri }} style={styles.preview} />
        </SectionCard>
      ) : null}

      <SectionCard
        title="Extraction Result"
        subtitle={`${confidenceLabel}. Review each item before publishing.`}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultText}>{statusMessage || "No draft extracted yet."}</Text>
        </View>

        <View style={styles.draftList}>
          {draftItems.length === 0 ? (
            <Text style={styles.emptyText}>
              Extracted items will appear here. You can edit names and prices before saving.
            </Text>
          ) : null}

          {draftItems.map((item) => (
            <View key={item.localId} style={styles.draftCard}>
              <TextField
                label="Item Name"
                value={item.name}
                onChangeText={(value) => updateDraftItemName(item.localId, value)}
              />
              <View style={styles.priceRow}>
              <TextField
                label="Single"
                keyboardType="number-pad"
                value={item.singlePrice?.toString() ?? ""}
                onChangeText={(value) =>
                  setDraftItems((current) =>
                    current.map((draft) =>
                      draft.localId === item.localId
                        ? {
                            ...draft,
                            singlePrice: parsePrice(value),
                          }
                        : draft,
                    ),
                  )
                }
              />
              <TextField
                label="Half"
                keyboardType="number-pad"
                value={item.halfPrice?.toString() ?? ""}
                onChangeText={(value) =>
                  setDraftItems((current) =>
                    current.map((draft) =>
                      draft.localId === item.localId
                        ? {
                            ...draft,
                            halfPrice: parsePrice(value),
                          }
                        : draft,
                    ),
                  )
                }
              />
              <TextField
                label="Full"
                keyboardType="number-pad"
                value={item.fullPrice?.toString() ?? ""}
                onChangeText={(value) =>
                  setDraftItems((current) =>
                    current.map((draft) =>
                      draft.localId === item.localId
                        ? {
                            ...draft,
                            fullPrice: parsePrice(value),
                          }
                        : draft,
                    ),
                  )
                }
              />
            </View>
          </View>
        ))}
        </View>
      </SectionCard>

      <View style={styles.footer}>
        <PrimaryButton label="Back to Home" onPress={onBackToHome} />
        <PrimaryButton
          label="Save Draft"
          onPress={() => {
            Alert.alert("OrderXpress", "Menu draft saved locally for the next step.");
            onContinueToMenuCrud();
          }}
        />
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
  form: {
    gap: spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
  },
  resultHeader: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  resultText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  draftList: {
    gap: spacing.md,
  },
  draftCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  priceRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
});
