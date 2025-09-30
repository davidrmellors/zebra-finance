import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { database } from '../services/database';
import { Category, CategoryTotal } from '../types/database';
import { theme } from '../theme/colors';

const PRESET_COLORS = [
  '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0',
  '#F44336', '#00BCD4', '#8BC34A', '#607D8B', '#FFC107',
  '#3F51B5', '#009688', '#FF5722', '#795548', '#CDDC39',
];

const PRESET_ICONS = [
  '🛒', '🍽️', '🚗', '🎬', '🛍️', '📄', '🏥', '💰', '📌',
  '🏠', '✈️', '📱', '💻', '🎮', '📚', '☕', '🎵', '🏃',
];

export const CategoriesScreen: React.FC = () => {
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

  useEffect(() => {
    loadCategoryTotals();
  }, []);

  const loadCategoryTotals = async () => {
    try {
      const totals = await database.getCategoryTotals();
      setCategoryTotals(totals);
    } catch (error) {
      console.error('Error loading category totals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await database.createCategory(newCategoryName.trim(), selectedColor, selectedIcon);
      await loadCategoryTotals();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category. It may already exist.');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await database.updateCategory(
        editingCategory.id,
        newCategoryName.trim(),
        selectedColor,
        selectedIcon
      );
      await loadCategoryTotals();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? Transactions with this category will be uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteCategory(categoryId);
              await loadCategoryTotals();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (categoryTotal: CategoryTotal) => {
    const category: Category = {
      id: categoryTotal.categoryId,
      name: categoryTotal.categoryName,
      color: categoryTotal.categoryColor,
      icon: '💰', // Default icon
      createdAt: new Date().toISOString(),
    };
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedColor(category.color);
    setSelectedIcon(category.icon || PRESET_ICONS[0]);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setNewCategoryName('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
    setEditingCategory(null);
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `R ${absAmount.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderCategoryItem = ({ item }: { item: CategoryTotal }) => {
    const isNegative = item.total < 0;

    return (
      <LinearGradient colors={theme.gradients.card} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryColorBadge, { backgroundColor: item.categoryColor }]} />
            <View style={styles.categoryText}>
              <Text style={styles.categoryName}>{item.categoryName}</Text>
              <Text style={styles.categoryCount}>{item.count} transactions</Text>
            </View>
          </View>
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCategory(item.categoryId, item.categoryName)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.categoryAmount}>
          <Text style={[
            styles.amountText,
            isNegative ? styles.negativeAmount : styles.positiveAmount
          ]}>
            {isNegative ? '-' : '+'}{formatAmount(item.total)}
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const renderColorPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Color</Text>
      <View style={styles.colorGrid}>
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorOption,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    </View>
  );

  const renderIconPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Icon</Text>
      <View style={styles.iconGrid}>
        {PRESET_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              selectedIcon === icon && styles.selectedIconOption,
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Text style={styles.iconText}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategoryModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        isEdit ? setShowEditModal(false) : setShowAddModal(false);
        resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient colors={theme.gradients.card} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? 'Edit Category' : 'Add New Category'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                isEdit ? setShowEditModal(false) : setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={theme.text.tertiary}
            />
          </View>

          {renderColorPicker()}
          {renderIconPicker()}

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={[styles.previewBadge, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewIcon}>{selectedIcon}</Text>
              <Text style={styles.previewText}>{newCategoryName || 'Category Name'}</Text>
            </View>
          </View>

          <LinearGradient
            colors={theme.gradients.accent}
            style={styles.saveButton}
          >
            <TouchableOpacity
              style={styles.buttonInner}
              onPress={isEdit ? handleEditCategory : handleAddCategory}
            >
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Save Changes' : 'Add Category'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </LinearGradient>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.gradients.primary} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </LinearGradient>
    );
  }

  const totalSpending = categoryTotals.reduce((sum, cat) => sum + (cat.total < 0 ? Math.abs(cat.total) : 0), 0);
  const totalIncome = categoryTotals.reduce((sum, cat) => sum + (cat.total > 0 ? cat.total : 0), 0);

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <Text style={styles.title}>📊 Categories</Text>
          <Text style={styles.subtitle}>Track your spending by category</Text>
        </LinearGradient>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={[theme.transaction.negative, theme.semantic.errorBright]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>Total Spending</Text>
            <Text style={styles.summaryValue}>R {totalSpending.toLocaleString('en-ZA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</Text>
          </LinearGradient>

          <LinearGradient
            colors={[theme.transaction.positive, theme.semantic.successBright]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>R {totalIncome.toLocaleString('en-ZA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</Text>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <FlatList
            data={categoryTotals}
            keyExtractor={(item) => item.categoryId.toString()}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No categories yet. Add one to get started!</Text>
            }
          />

          <LinearGradient
            colors={theme.gradients.accent}
            style={styles.addButton}
          >
            <TouchableOpacity
              style={styles.buttonInner}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Category</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {renderCategoryModal(false)}
        {renderCategoryModal(true)}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    letterSpacing: 0.5,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.accent,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.text.primary,
    opacity: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  categoryItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: theme.text.tertiary,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: theme.semantic.error,
  },
  actionButtonText: {
    fontSize: 16,
  },
  categoryAmount: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  negativeAmount: {
    color: theme.transaction.negative,
  },
  positiveAmount: {
    color: theme.transaction.positive,
  },
  emptyText: {
    fontSize: 16,
    color: theme.text.tertiary,
    textAlign: 'center',
    marginTop: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonInner: {
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: theme.text.secondary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: theme.accent.primary,
    borderWidth: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.background.secondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderColor: theme.accent.primary,
  },
  iconText: {
    fontSize: 24,
  },
  preview: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  previewIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  previewText: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
