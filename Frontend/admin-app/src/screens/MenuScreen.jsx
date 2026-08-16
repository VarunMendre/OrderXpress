import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { menuApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import PageHeader from '../components/PageHeader';
import BottomSheet from '../components/BottomSheet';
import Toggle from '../components/Toggle';
import { Button, Badge } from '../components';
import Spinner from '../components/Spinner';
import { colors, spacing, radius, shadows } from '../theme';
import { formatCurrency } from '../utils/format';

const FALLBACK_EMOJI = {
  Starters: '🥗',
  Mains: '🍛',
  Drinks: '🥤',
  Desserts: '🍰',
};

const DEFAULT_CATEGORIES = ['Starters', 'Mains', 'Drinks', 'Desserts'];

export default function MenuScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Starters',
    isVegetarian: false,
    portionType: 'full',
    description: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (user) {
      fetchMenuItems();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.list();
      const list = Array.isArray(data) ? data : data.items || [];
      setItems(list);
      const cats = [...new Set(list.map((i) => i.category).filter(Boolean))];
      setCategories([...DEFAULT_CATEGORIES, ...cats.filter((c) => !DEFAULT_CATEGORIES.includes(c))]);
    } catch (e) {
      console.error('Failed to fetch menu items:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Starters',
      isVegetarian: false,
      portionType: 'full',
      description: '',
      isAvailable: true,
    });
  };

  const openCreate = () => {
    setEditingItemId(null);
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (item) => {
    setEditingItemId(item._id);
    setFormData({
      name: item.name,
      price: String(item.price),
      category: item.category || 'Starters',
      isVegetarian: item.isVegetarian || false,
      portionType: item.portionType || 'full',
      description: item.description || '',
      isAvailable: item.isAvailable !== false,
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price || Number(formData.price) <= 0) {
      Alert.alert('Error', 'Please fill in item name and price');
      return;
    }
    setIsSaving(true);
    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category,
      isVegetarian: formData.isVegetarian,
      portionType: formData.portionType,
      description: formData.description.trim(),
      isAvailable: formData.isAvailable,
    };
    try {
      if (editingItemId) {
        await menuApi.update(editingItemId, payload);
      } else {
        await menuApi.create(payload);
      }
      setSheetOpen(false);
      fetchMenuItems();
    } catch (e) {
      console.error('Failed to save menu item:', e);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await menuApi.delete(editingItemId);
            setSheetOpen(false);
            fetchMenuItems();
          } catch (e) {
            console.error('Failed to delete menu item:', e);
            Alert.alert('Error', 'Failed to delete item');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (!user) {
    return null;
  }

  const q = searchQuery.trim().toLowerCase();
  const visibleItems = q
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q)
      )
    : items;

  return (
    <Screen>
      <AppHeader onNotifications={() => {}} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <PageHeader
          title="Products"
          sub={`${visibleItems.length} items`}
          right={
            <Pressable style={styles.addBtn} onPress={openCreate}>
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.addBtnText}>Add Item</Text>
            </Pressable>
          }
        />

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <Spinner size="large" />
          </View>
        ) : visibleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {visibleItems.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                onPress={() => openEdit(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomSheet visible={sheetOpen} onRequestClose={() => setSheetOpen(false)}>
        <Text style={styles.sheetTitle}>
          {editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
        </Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Item Name</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Paneer Tikka"
            placeholderTextColor={colors.textMuted}
            value={formData.name}
            onChangeText={(v) => setFormData((p) => ({ ...p, name: v }))}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
              style={styles.picker}
            >
              {categories.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Price (₹)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(v) => setFormData((p) => ({ ...p, price: v }))}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldTextarea]}
            placeholder="Short description..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(v) => setFormData((p) => ({ ...p, description: v }))}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Available</Text>
          <Toggle
            value={formData.isAvailable}
            onValueChange={(v) => setFormData((p) => ({ ...p, isAvailable: v }))}
          />
        </View>

        <View style={styles.sheetActions}>
          <Button variant="secondary" onPress={() => setSheetOpen(false)} style={styles.sheetActionBtn}>
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            loading={isSaving}
            disabled={isDeleting}
            style={styles.sheetActionBtn}
          >
            {editingItemId ? 'Save Changes' : 'Save Item'}
          </Button>
        </View>

        {editingItemId && (
          <Pressable
            style={({ pressed }) => [styles.deleteRow, pressed && styles.pressed]}
            onPress={handleDelete}
            disabled={isDeleting || isSaving}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={styles.deleteText}>
              {isDeleting ? 'Deleting...' : 'Delete Item'}
            </Text>
          </Pressable>
        )}
      </BottomSheet>
    </Screen>
  );
}

function ProductCard({ item, onPress }) {
  const available = item.isAvailable !== false;
  const image = item.imageUrl || item.image;

  return (
    <Pressable
      style={({ pressed }) => [styles.productCard, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.productImg}>
        {image ? (
          <Image source={{ uri: image }} style={styles.productImgNative} resizeMode="cover" />
        ) : (
          <Text style={styles.productEmoji}>
            {FALLBACK_EMOJI[item.category] || '🍽️'}
          </Text>
        )}
        <Badge variant={available ? 'success' : 'warning'} size="sm" style={styles.stockBadge}>
          {available ? 'In stock' : 'Unavailable'}
        </Badge>
      </View>
      <View style={styles.productBody}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category || '—'}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  loadingState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  productCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  cardPressed: {
    opacity: 0.85,
  },
  productImg: {
    height: 100,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImgNative: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productEmoji: {
    fontSize: 34,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productCategory: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  field: {
    gap: 6,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fieldInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  fieldTextarea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  pickerWrap: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  sheetActionBtn: {
    flex: 1,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
});