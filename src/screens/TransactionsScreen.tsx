import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { database } from '../services/database';
import { TransactionWithCategory } from '../types/database';
import { theme } from '../theme/colors';

interface TransactionsScreenProps {
  onTransactionPress: (transactionId: number) => void;
  onBack: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  onTransactionPress,
  onBack,
}) => {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await database.getTransactions(100);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await database.searchTransactions(query);
        setTransactions(results);
      } catch (error) {
        console.error('Error searching transactions:', error);
      }
    } else {
      loadTransactions();
    }
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

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
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
});
