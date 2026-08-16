import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { menuApi } from '../api/admin';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import { Button, Input, Badge } from '../components';
import Spinner from '../components/Spinner';
import { colors, spacing, radius, typography } from '../theme';

export default function MenuScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
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
    try {
      const data = await menuApi.list();
      setItems(data.items || []);
      const cats = [...new Set((data.items || []).map((i) => i.category).filter(Boolean))];
      setCategories(cats);
    } catch (e) {
      console.error('Failed to fetch menu items:', e);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.portionType) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setIsCreating(true);
    try {
      await menuApi.create({
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        isVegetarian: formData.isVegetarian,
        portionType: formData.portionType,
        description: formData.description,
        isAvailable: formData.isAvailable,
      });
      resetForm();
      fetchMenuItems();
    } catch (e) {
      console.error('Failed to create menu item:', e);
      Alert.alert('Error', 'Failed to create item');
    } finally {
      setIsCreating(false);
    }
  };

  const onUpdateSubmit = async () => {
    setIsUpdating(true);
    try {
      await menuApi.update(editingItemId, {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        isVegetarian: formData.isVegetarian,
        portionType: formData.portionType,
        description: formData.description,
        isAvailable: formData.isAvailable,
      });
      setEditingItemId(null);
      resetForm();
      fetchMenuItems();
    } catch (e) {
      console.error('Failed to update menu item:', e);
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (itemId) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeletingItemId(itemId);
        try {
          await menuApi.delete(itemId);
          fetchMenuItems();
        } catch (e) {
          console.error('Failed to delete menu item:', e);
        } finally {
          setDeletingItemId(null);
        }
      }},
    ]);
  };

  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setFormData({
      name: item.name,
      price: String(item.price),
      category: item.category,
      isVegetarian: item.isVegetarian || false,
      portionType: item.portionType || 'full',
      description: item.description || '',
      isAvailable: item.isAvailable !== false,
    });
  };

  const resetForm = () => {
    setEditingItemId(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      isVegetarian: false,
      portionType: 'full',
      description: '',
      isAvailable: true,
    });
  };

  const filteredItems = selectedCategory
    ? items.filter((i) => i.category === selectedCategory)
    : items;

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <AppHeader title="Menu Management" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.filterRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterButton,
                  selectedCategory === cat && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === cat && styles.filterButtonTextActive,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedCategory && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory('')}
            >
              <Text style={[
                styles.filterButtonText,
                !selectedCategory && styles.filterButtonTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {editingItemId ? 'Edit Menu Item' : 'Add New Item'}
          </Text>
          <Input
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Item name"
            label="Name"
          />
          <Input
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
            placeholder="Price"
            label="Price (₹)"
            keyboardType="numeric"
          />
          <Input
            value={formData.category}
            onChangeText={(value) => handleInputChange('category', value)}
            placeholder="Category"
            label="Category"
          />
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxLabel}>Vegetarian</Text>
            <Switch
              value={formData.isVegetarian}
              onValueChange={(value) => handleInputChange('isVegetarian', value)}
            />
          </View>
          <Input
            value={formData.portionType}
            onChangeText={(value) => handleInputChange('portionType', value)}
            placeholder="Portion type"
            label="Portion Type"
          />
          <Input
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Description (optional)"
            label="Description"
            multiline
            numberOfLines={3}
          />
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxLabel}>Available</Text>
            <Switch
              value={formData.isAvailable}
              onValueChange={(value) => handleInputChange('isAvailable', value)}
            />
          </View>
          <View style={styles.formActions}>
            <Button
              onPress={editingItemId ? onUpdateSubmit : onSubmit}
              disabled={isCreating || isUpdating}
            >
              {editingItemId ? 'Update Menu Item' : 'Add Menu Item'}
            </Button>
            {editingItemId && (
              <Button variant="secondary" onPress={resetForm} disabled={isUpdating}>
                Cancel
              </Button>
            )}
          </View>
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No menu items found</Text>
          </View>
        ) : (
          <View style={styles.itemList}>
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onDelete={() => handleDelete(item._id)}
                onEdit={handleEdit}
                isCreating={isCreating}
                isUpdating={isUpdating}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function MenuItemCard({ item, onDelete, onEdit, isCreating, isUpdating }) {
  return (
    <View style={styles.menuItemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemMeta}>
        {item.category && <Text style={styles.itemCategory}>{item.category}</Text>}
        <Badge variant={item.isVegetarian ? 'success' : 'warning'} size="sm">
          {item.isVegetarian ? 'Veg' : 'Non-Veg'}
        </Badge>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(item)}
          disabled={isCreating || isUpdating}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item._id)}
          disabled={isCreating || isUpdating}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.primaryForeground,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  itemList: {
    gap: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
  menuItemCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.textMuted,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  editButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

