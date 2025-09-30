import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { syncService } from '../services/syncService';
import { database } from '../services/database';
import { nudgeService, FinancialNudge } from '../services/nudgeService';
import { theme } from '../theme/colors';

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const [syncing, setSyncing] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [nudges, setNudges] = useState<FinancialNudge[]>([]);
  const [loadingNudges, setLoadingNudges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    loadTransactionCount();
    loadNudges();
    loadLastSyncTime();
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

  const loadLastSyncTime = async () => {
    try {
      const timestamp = await syncService.getLastSyncTime();
      setLastSyncTime(timestamp);
    } catch (error) {
      console.error('Error loading last sync time:', error);
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
        if (result.lastSyncTime) {
          setLastSyncTime(result.lastSyncTime);
        }
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

  const getNudgeColor = (category: FinancialNudge['category']) => {
    switch (category) {
      case 'warning':
        return theme.semantic.warningBright;
      case 'saving':
        return theme.semantic.successBright;
      case 'spending':
        return theme.semantic.errorBright;
      default:
        return theme.semantic.infoBright;
    }
  };

  const formatLastSyncTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never synced';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <Text style={styles.title}>🦓 Zebra Finance</Text>
          <Text style={styles.subtitle}>Private Banking Intelligence</Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
        >
          <View style={styles.content}>
            <LinearGradient
              colors={[theme.accent.primary, theme.accent.secondary]}
              style={styles.statCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statLabel}>Total Transactions</Text>
              <Text style={styles.statValue}>{transactionCount}</Text>
            </LinearGradient>

            <LinearGradient
              colors={theme.gradients.accent}
              style={[styles.syncButton, syncing && styles.buttonDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={styles.syncButtonInner}
                onPress={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator color={theme.text.primary} />
                ) : (
                  <Text style={styles.buttonText}>🔄 Sync Transactions</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {lastSyncTime !== null && (
              <Text style={styles.lastSyncText}>
                Last synced: {formatLastSyncTime(lastSyncTime)}
              </Text>
            )}

            {/* Financial Nudges */}
            <View style={styles.nudgesSection}>
              <Text style={styles.sectionTitle}>💡 Financial Insights</Text>
              {loadingNudges ? (
                <ActivityIndicator style={styles.nudgeLoader} color={theme.accent.primary} />
              ) : (
                nudges.slice(0, 3).map((nudge) => (
                  <LinearGradient
                    key={nudge.id}
                    colors={theme.gradients.card}
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
                  </LinearGradient>
                ))
              )}
            </View>
          </View>
        </ScrollView>
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
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  statCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border.accent,
  },
  statLabel: {
    color: theme.text.primary,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statValue: {
    color: theme.text.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  syncButton: {
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  syncButtonInner: {
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 12,
    color: theme.text.tertiary,
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 16,
  },
  nudgesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  nudgeLoader: {
    marginVertical: 20,
  },
  nudgeCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: theme.border.primary,
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
    color: theme.text.primary,
    marginBottom: 4,
  },
  nudgeMessage: {
    fontSize: 13,
    color: theme.text.secondary,
    lineHeight: 20,
  },
});
