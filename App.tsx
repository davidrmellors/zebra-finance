import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from './src/screens/LoginScreen';
import { TransactionDetailScreen } from './src/screens/TransactionDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MainTabs } from './src/navigation/MainTabs';
import { investecAuth } from './src/services/investecAuth';
import { database } from './src/services/database';

type OverlayScreen = 'none' | 'transactionDetail' | 'settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen>('none');
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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setOverlayScreen('none');
  };

  const handleTransactionPress = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setOverlayScreen('transactionDetail');
  };

  const handleBackFromDetail = () => {
    setOverlayScreen('none');
  };

  const handleNavigateToSettings = () => {
    setOverlayScreen('settings');
  };

  const handleBackFromSettings = () => {
    setOverlayScreen('none');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </>
    );
  }

  // Show overlay screens on top of tabs
  if (overlayScreen === 'transactionDetail' && selectedTransactionId) {
    return (
      <>
        <TransactionDetailScreen
          transactionId={selectedTransactionId}
          onBack={handleBackFromDetail}
        />
        <StatusBar style="auto" />
      </>
    );
  }

  if (overlayScreen === 'settings') {
    return (
      <>
        <SettingsScreen onBack={handleBackFromSettings} onLogout={handleLogout} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <NavigationContainer>
        <MainTabs
          onLogout={handleLogout}
          onNavigateToTransactionDetail={handleTransactionPress}
          onNavigateToSettings={handleNavigateToSettings}
        />
      </NavigationContainer>
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
