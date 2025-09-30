import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '../services/database';
import { TransactionWithCategory, Category } from '../types/database';
import { theme } from '../theme/colors';

interface TransactionFilters {
  categoryId?: number;
  transactionType?: 'debit' | 'credit' | 'all';
  startDate?: string;
  endDate?: string;
}

interface TransactionsScreenProps {
  onTransactionPress: (transactionId: number) => void;
  onBack: () => void;
  setCategoryFilterRef?: (setFilter: (categoryId: number) => void) => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  onTransactionPress,
  onBack,
  setCategoryFilterRef,
}) => {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    transactionType: 'all',
  });
  const [tempFilters, setTempFilters] = useState<TransactionFilters>({
    transactionType: 'all',
  });

  // Load categories for filter
  useEffect(() => {
    loadCategories();
  }, []);

  // Expose method to apply category filter from external components
  useEffect(() => {
    if (setCategoryFilterRef) {
      setCategoryFilterRef((categoryId: number) => {
        setFilters({
          transactionType: 'all',
          categoryId: categoryId,
        });
        setTempFilters({
          transactionType: 'all',
          categoryId: categoryId,
        });
      });
    }
  }, [setCategoryFilterRef]);

  const loadCategories = async () => {
    try {
      const cats = await database.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await database.getTransactions(1000);
      setAllTransactions(data);
      applyFilters(data, filters);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: TransactionWithCategory[], currentFilters: TransactionFilters) => {
    let filtered = [...data];

    // Category filter
    if (currentFilters.categoryId) {
      filtered = filtered.filter(t => t.categoryId === currentFilters.categoryId);
    }

    // Transaction type filter
    if (currentFilters.transactionType && currentFilters.transactionType !== 'all') {
      filtered = filtered.filter(t => t.type.toLowerCase() === currentFilters.transactionType);
    }

    // Date range filter
    if (currentFilters.startDate) {
      filtered = filtered.filter(t => t.transactionDate >= currentFilters.startDate!);
    }
    if (currentFilters.endDate) {
      filtered = filtered.filter(t => t.transactionDate <= currentFilters.endDate!);
    }

    setTransactions(filtered);
  };

  // Reload transactions when screen comes into focus or filters change
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  // Re-apply filters when they change
  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters(allTransactions, filters);
    }
  }, [filters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [filters]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Search within filtered results
      const searchResults = transactions.filter(t =>
        t.description.toLowerCase().includes(query.toLowerCase())
      );
      setTransactions(searchResults);
    } else {
      applyFilters(allTransactions, filters);
    }
  };

  const handleOpenFilterModal = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = { transactionType: 'all' as const };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setShowFilterModal(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.transactionType && filters.transactionType !== 'all') count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = Math.abs(amount).toFixed(2);
    // Use transaction type to determine if it's a debit (money out) or credit (money in)
    return type.toLowerCase() === 'debit' ? `-R${formatted}` : `R${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTransaction = ({ item }: { item: TransactionWithCategory }) => (
    <TouchableOpacity onPress={() => onTransactionPress(item.id)}>
      <LinearGradient colors={theme.gradients.card} style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.transactionDate)}</Text>
          {item.categoryName && (
            <View
              style={[styles.categoryBadge, { backgroundColor: item.categoryColor || theme.border.secondary }]}
            >
              <Text style={styles.categoryText}>{item.categoryName}</Text>
            </View>
          )}
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, item.type.toLowerCase() === 'debit' && styles.negativeAmount]}>
            {formatAmount(item.amount, item.type)}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.gradients.primary} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </LinearGradient>
    );
  }

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient colors={theme.gradients.card} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !tempFilters.categoryId && styles.categoryChipSelected,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, categoryId: undefined })}
                >
                  <Text style={styles.categoryChipText}>All</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: cat.color },
                      tempFilters.categoryId === cat.id && styles.categoryChipSelected,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, categoryId: cat.id })}
                  >
                    <Text style={styles.categoryChipText}>{cat.icon} {cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Transaction Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Transaction Type</Text>
              <View style={styles.typeFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tempFilters.transactionType === 'all' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, transactionType: 'all' })}
                >
                  <Text style={styles.typeButtonText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tempFilters.transactionType === 'debit' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, transactionType: 'debit' })}
                >
                  <Text style={styles.typeButtonText}>Debits</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tempFilters.transactionType === 'credit' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, transactionType: 'credit' })}
                >
                  <Text style={styles.typeButtonText}>Credits</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="Start Date (YYYY-MM-DD)"
                placeholderTextColor={theme.text.tertiary}
                value={tempFilters.startDate || ''}
                onChangeText={(text) => setTempFilters({ ...tempFilters, startDate: text })}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="End Date (YYYY-MM-DD)"
                placeholderTextColor={theme.text.tertiary}
                value={tempFilters.endDate || ''}
                onChangeText={(text) => setTempFilters({ ...tempFilters, endDate: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <LinearGradient
              colors={theme.gradients.accent}
              style={styles.applyButton}
            >
              <TouchableOpacity
                style={styles.buttonInner}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Transactions</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={handleOpenFilterModal}
            >
              <Text style={styles.filterButtonText}>🔍</Text>
              {getActiveFilterCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                Pull down to refresh or sync your account
              </Text>
            </View>
          }
        />

        {renderFilterModal()}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  filterButtonText: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.accent.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: theme.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  searchInput: {
    backgroundColor: theme.background.input,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  transactionLeft: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  categoryText: {
    color: theme.text.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.transaction.positive,
  },
  negativeAmount: {
    color: theme.transaction.negative,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.tertiary,
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
  modalBody: {
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    borderColor: theme.accent.primary,
  },
  categoryChipText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  typeFilterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.background.card,
  },
  typeButtonText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dateInput: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.primary,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  clearButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonInner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
