import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { database } from '../services/database';
import { TransactionWithCategory, Category } from '../types/database';
import { theme } from '../theme/colors';

interface TransactionDetailScreenProps {
  transactionId: number;
  onBack: () => void;
}

export const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({
  transactionId,
  onBack,
}) => {
  const [transaction, setTransaction] = useState<TransactionWithCategory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [transactionId]);

  const loadData = async () => {
    try {
      const [txn, cats] = await Promise.all([
        database.getTransactionById(transactionId),
        database.getCategories(),
      ]);
      setTransaction(txn);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: number) => {
    if (!transaction) return;

    try {
      await database.updateTransactionCategory(transaction.id, categoryId);
      const updatedTxn = await database.getTransactionById(transaction.id);
      setTransaction(updatedTxn);
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-R${formatted}` : `R${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || !transaction) {
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
          <Text style={styles.title}>Transaction Detail</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <LinearGradient
            colors={[theme.accent.primary, theme.accent.secondary]}
            style={styles.amountCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={[styles.amount, transaction.amount < 0 && styles.negativeAmount]}>
              {formatAmount(transaction.amount)}
            </Text>
          </LinearGradient>

          <LinearGradient colors={theme.gradients.card} style={styles.detailsCard}>
            <DetailRow label="Description" value={transaction.description} />
            <DetailRow label="Date" value={formatDate(transaction.transactionDate)} />
            <DetailRow label="Type" value={transaction.type} />
            <DetailRow label="Transaction Type" value={transaction.transactionType} />
            <DetailRow label="Status" value={transaction.status} />
            {transaction.cardNumber && (
              <DetailRow label="Card Number" value={transaction.cardNumber} />
            )}
            <DetailRow label="Account ID" value={transaction.accountId} />
          </LinearGradient>

          <LinearGradient colors={theme.gradients.card} style={styles.categoryCard}>
            <Text style={styles.sectionTitle}>Category</Text>
            {transaction.categoryName ? (
              <View
                style={[
                  styles.selectedCategory,
                  { backgroundColor: transaction.categoryColor || theme.border.secondary },
                ]}
              >
                <Text style={styles.selectedCategoryText}>{transaction.categoryName}</Text>
              </View>
            ) : (
              <Text style={styles.noCategoryText}>No category assigned</Text>
            )}
            <LinearGradient
              colors={theme.gradients.accent}
              style={styles.changeCategoryButton}
            >
              <TouchableOpacity
                style={styles.buttonInner}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.changeCategoryText}>
                  {transaction.categoryName ? 'Change Category' : 'Assign Category'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>
        </ScrollView>

        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient colors={theme.gradients.card} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryOption}
                    onPress={() => handleCategorySelect(item.id)}
                  >
                    <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryName}>
                      {item.icon} {item.name}
                    </Text>
                    {transaction.categoryId === item.id && (
                      <Text style={styles.selectedIndicator}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </LinearGradient>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
    paddingTop: 50,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  amountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border.accent,
  },
  amountLabel: {
    color: theme.text.primary,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  amount: {
    color: theme.text.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  negativeAmount: {
    color: theme.transaction.negative,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.text.tertiary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: theme.text.primary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 12,
  },
  selectedCategory: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedCategoryText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noCategoryText: {
    fontSize: 14,
    color: theme.text.tertiary,
    textAlign: 'center',
    marginBottom: 12,
  },
  changeCategoryButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonInner: {
    padding: 12,
    alignItems: 'center',
  },
  changeCategoryText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: theme.text.primary,
    flex: 1,
  },
  selectedIndicator: {
    fontSize: 18,
    color: theme.accent.primary,
    fontWeight: 'bold',
  },
});
