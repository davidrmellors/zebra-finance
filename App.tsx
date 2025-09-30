import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { TransactionDetailScreen } from './src/screens/TransactionDetailScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { investecAuth } from './src/services/investecAuth';
import { database } from './src/services/database';

type Screen = 'home' | 'transactions' | 'transactionDetail' | 'chat' | 'settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await database.init();

      // Check authentication status
      const authenticated = await investecAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('home');
  };

  const handleNavigateToTransactions = () => {
    setCurrentScreen('transactions');
  };

  const handleNavigateToHome = () => {
    setCurrentScreen('home');
  };

  const handleTransactionPress = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setCurrentScreen('transactionDetail');
  };

  const handleBackFromDetail = () => {
    setCurrentScreen('transactions');
  };

  const handleNavigateToChat = () => {
    setCurrentScreen('chat');
  };

  const handleNavigateToSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackFromChat = () => {
    setCurrentScreen('home');
  };

  const handleBackFromSettings = () => {
    setCurrentScreen('home');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const renderScreen = () => {
    if (!isAuthenticated) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onLogout={handleLogout}
            onNavigateToTransactions={handleNavigateToTransactions}
            onNavigateToChat={handleNavigateToChat}
          />
        );
      case 'transactions':
        return (
          <TransactionsScreen
            onTransactionPress={handleTransactionPress}
            onBack={handleNavigateToHome}
          />
        );
      case 'transactionDetail':
        return selectedTransactionId ? (
          <TransactionDetailScreen
            transactionId={selectedTransactionId}
            onBack={handleBackFromDetail}
          />
        ) : null;
      case 'chat':
        return (
          <ChatScreen
            onBack={handleBackFromChat}
            onOpenSettings={handleNavigateToSettings}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={handleBackFromSettings}
          />
        );
      default:
        return (
          <HomeScreen
            onLogout={handleLogout}
            onNavigateToTransactions={handleNavigateToTransactions}
            onNavigateToChat={handleNavigateToChat}
          />
        );
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
