import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { TextField } from "../components/TextField";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  publishMenu,
  toggleMenuItemAvailability,
  updateMenuItem,
  type MenuCategory,
  type MenuItem,
} from "../services/menuCrudService";
import { colors, radius, spacing } from "../theme/tokens";

type DraftMenuItem = Omit<MenuItem, "id"> & {
  id?: string;
};

const initialDraft: DraftMenuItem = {
  name: "",
  category: "Main Course",
  isAvailable: true,
};

export function MenuCrudScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [draft, setDraft] = useState<DraftMenuItem>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    const result = await listMenuItems();
    setItems(result);
  }

  function resetDraft() {
    setDraft(initialDraft);
    setEditingId(null);
  }

  function toNumberOrUndefined(value: string): number | undefined {
    if (value.trim().length === 0) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  async function handleSave() {
    const payload = {
      name: draft.name,
      category: draft.category,
      singlePrice: draft.singlePrice,
      halfPrice: draft.halfPrice,
      fullPrice: draft.fullPrice,
    };

    const saved = editingId
      ? await updateMenuItem(editingId, payload)
      : await createMenuItem(payload);

    if (!saved) {
      setStatusMessage("Unable to save menu item.");
      return;
    }

    setStatusMessage(editingId ? "Menu item updated." : "Menu item added.");
    resetDraft();
    await loadItems();
  }

  async function handleDelete(id: string) {
    const deleted = await deleteMenuItem(id);
    if (!deleted) {
      setStatusMessage("Unable to delete menu item.");
      return;
    }

    setStatusMessage("Menu item deleted.");
    await loadItems();
  }

  async function handleToggle(id: string) {
    const updated = await toggleMenuItemAvailability(id);
    if (!updated) {
      setStatusMessage("Unable to update availability.");
      return;
    }

    setStatusMessage("Availability updated.");
    await loadItems();
  }

  async function handlePublish() {
    const published = await publishMenu();
    setStatusMessage(
      published
        ? "Menu published successfully."
        : "Unable to publish menu right now.",
    );
  }

  function beginEdit(item: MenuItem) {
    setEditingId(item.id);
    setDraft({
      id: item.id,
      name: item.name,
      category: item.category,
      singlePrice: item.singlePrice,
      halfPrice: item.halfPrice,
      fullPrice: item.fullPrice,
      isAvailable: item.isAvailable,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Menu CRUD</Text>
        <Text style={styles.title}>Edit, add, delete, and publish menu items</Text>
        <Text style={styles.subtitle}>
          This is the admin control surface for managing the live restaurant menu.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Items" value={String(items.length)} hint="Current live items" />
        <StatCard label="Available" value={String(items.filter((item) => item.isAvailable).length)} hint="Open for ordering" />
      </View>

      <SectionCard
        title={editingId ? "Edit Menu Item" : "Add Menu Item"}
        subtitle="Use this form to manage menu entries before publishing."
      >
        <View style={styles.form}>
          <TextField
            label="Item Name"
            placeholder="Paneer Butter Masala"
            value={draft.name}
            onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
          />

          <TextField
            label="Category"
            placeholder="Main Course"
            value={draft.category}
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, category: value as MenuCategory }))
            }
          />

          <View style={styles.priceRow}>
            <TextField
              label="Single"
              keyboardType="number-pad"
              value={draft.singlePrice?.toString() ?? ""}
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, singlePrice: toNumberOrUndefined(value) }))
              }
            />
            <TextField
              label="Half"
              keyboardType="number-pad"
              value={draft.halfPrice?.toString() ?? ""}
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, halfPrice: toNumberOrUndefined(value) }))
              }
            />
            <TextField
              label="Full"
              keyboardType="number-pad"
              value={draft.fullPrice?.toString() ?? ""}
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, fullPrice: toNumberOrUndefined(value) }))
              }
            />
          </View>

          <View style={styles.actionRow}>
            <PrimaryButton
              label={editingId ? "Update Item" : "Add Item"}
              onPress={() => {
                void handleSave();
              }}
            />
            <PrimaryButton label="Reset" onPress={resetDraft} />
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Menu Items" subtitle="Edit or remove items from the live menu.">
        <View style={styles.itemList}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.category} • {item.isAvailable ? "Available" : "Hidden"}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {item.singlePrice ?? item.halfPrice ?? item.fullPrice ?? 0}
                </Text>
              </View>

              <View style={styles.itemActions}>
                <PrimaryButton label="Edit" onPress={() => beginEdit(item)} />
                <PrimaryButton
                  label={item.isAvailable ? "Hide" : "Show"}
                  onPress={() => {
                    void handleToggle(item.id);
                  }}
                />
                <PrimaryButton
                  label="Delete"
                  onPress={() => {
                    void handleDelete(item.id);
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Publish" subtitle="Push the latest menu state to customer views and QR flow.">
        <View style={styles.publishArea}>
          <Text style={styles.status}>{statusMessage || "Your latest changes are not published yet."}</Text>
          <PrimaryButton
            label="Publish Menu"
            onPress={() => {
              void handlePublish();
            }}
          />
        </View>
      </SectionCard>
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  itemList: {
    gap: spacing.md,
  },
  itemCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  itemMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  itemPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  itemActions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  publishArea: {
    gap: spacing.md,
  },
  status: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
