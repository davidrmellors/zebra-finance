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
import { Category } from '../types/database';
import { theme } from '../theme/colors';

interface CategoryManagementScreenProps {
  onBack: () => void;
}

const PRESET_COLORS = [
  '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0',
  '#F44336', '#00BCD4', '#8BC34A', '#607D8B', '#FFC107',
  '#3F51B5', '#009688', '#FF5722', '#795548', '#CDDC39',
];

const PRESET_ICONS = [
  '🛒', '🍽️', '🚗', '🎬', '🛍️', '📄', '🏥', '💰', '📌',
  '🏠', '✈️', '📱', '💻', '🎮', '📚', '☕', '🎵', '🏃',
];

export const CategoryManagementScreen: React.FC<CategoryManagementScreenProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await database.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
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
      await loadCategories();
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
      await loadCategories();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? Transactions with this category will be uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteCategory(category.id);
              await loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (category: Category) => {
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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <LinearGradient colors={theme.gradients.card} style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryColorBadge, { backgroundColor: item.color }]} />
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

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

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Categories</Text>
        </LinearGradient>

        <View style={styles.content}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
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
              <Text style={styles.addButtonText}>+ Add New Category</Text>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: theme.text.primary,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  categoryItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.accent.primary,
  },
  deleteButton: {
    backgroundColor: theme.transaction.negative,
  },
  actionButtonText: {
    color: theme.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: theme.text.primary,
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
