import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { investecAuth } from '../services/investecAuth';
import { syncService } from '../services/syncService';
import { database } from '../services/database';
import { nudgeService, FinancialNudge } from '../services/nudgeService';

interface HomeScreenProps {
  onLogout: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToChat: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, onNavigateToTransactions, onNavigateToChat }) => {
  const [syncing, setSyncing] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [nudges, setNudges] = useState<FinancialNudge[]>([]);
  const [loadingNudges, setLoadingNudges] = useState(false);

  useEffect(() => {
    loadTransactionCount();
    loadNudges();
  }, []);

  const loadTransactionCount = async () => {
    try {
      const count = await database.getTotalTransactions();
      setTransactionCount(count);
    } catch (error) {
      console.error('Error loading transaction count:', error);
    }
  };

  const loadNudges = async () => {
    setLoadingNudges(true);
    try {
      const generatedNudges = await nudgeService.generateNudges();
      setNudges(generatedNudges);
    } catch (error) {
      console.error('Error loading nudges:', error);
    } finally {
      setLoadingNudges(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);

    try {
      const result = await syncService.syncRecentTransactions();

      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Synced ${result.newTransactions} transactions. Total: ${result.totalTransactions}`
        );
        setTransactionCount(result.totalTransactions);
        loadNudges(); // Refresh nudges after sync
      } else {
        Alert.alert('Sync Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert(
        'Sync Error',
        error instanceof Error ? error.message : 'Failed to sync transactions'
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await investecAuth.logout();
    onLogout();
  };

  const getNudgeColor = (category: FinancialNudge['category']) => {
    switch (category) {
      case 'warning':
        return '#FF9800';
      case 'saving':
        return '#4CAF50';
      case 'spending':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🦓 Zebra Finance</Text>
        <Text style={styles.subtitle}>Welcome to your AI Finance Assistant</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Transactions</Text>
          <Text style={styles.statValue}>{transactionCount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🔄 Sync Transactions</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewTransactionsButton}
          onPress={onNavigateToTransactions}
        >
          <Text style={styles.buttonText}>📋 View Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={onNavigateToChat}
        >
          <Text style={styles.buttonText}>💬 AI Financial Assistant</Text>
        </TouchableOpacity>

        {/* Financial Nudges */}
        <View style={styles.nudgesSection}>
          <Text style={styles.sectionTitle}>💡 Financial Insights</Text>
          {loadingNudges ? (
            <ActivityIndicator style={styles.nudgeLoader} color="#6C63FF" />
          ) : (
            nudges.slice(0, 3).map((nudge) => (
              <View
                key={nudge.id}
                style={[
                  styles.nudgeCard,
                  { borderLeftColor: getNudgeColor(nudge.category) },
                ]}
              >
                <Text style={styles.nudgeIcon}>{nudge.icon}</Text>
                <View style={styles.nudgeContent}>
                  <Text style={styles.nudgeTitle}>{nudge.title}</Text>
                  <Text style={styles.nudgeMessage}>{nudge.message}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewTransactionsButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  chatButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nudgesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  nudgeLoader: {
    marginVertical: 20,
  },
  nudgeCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  nudgeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nudgeContent: {
    flex: 1,
  },
  nudgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nudgeMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
