import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from './src/screens/LoginScreen';
import { TransactionDetailScreen } from './src/screens/TransactionDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { CategoryManagementScreen } from './src/screens/CategoryManagementScreen';
import { MainTabs } from './src/navigation/MainTabs';
import { investecAuth } from './src/services/investecAuth';
import { database } from './src/services/database';
import { theme } from './src/theme/colors';

type OverlayScreen = 'none' | 'transactionDetail' | 'settings' | 'categoryManagement';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen>('none');
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const navigationRef = useRef<any>(null);

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

  const handleNavigateToCategoryManagement = () => {
    setOverlayScreen('categoryManagement');
  };

  const handleBackFromCategoryManagement = () => {
    setOverlayScreen('none');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <MainTabs
          onLogout={handleLogout}
          onNavigateToTransactionDetail={handleTransactionPress}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToCategoryManagement={handleNavigateToCategoryManagement}
        />
      </NavigationContainer>

      {overlayScreen === 'transactionDetail' && selectedTransactionId && (
        <View style={StyleSheet.absoluteFill}>
          <TransactionDetailScreen
            transactionId={selectedTransactionId}
            onBack={handleBackFromDetail}
          />
        </View>
      )}

      {overlayScreen === 'settings' && (
        <View style={StyleSheet.absoluteFill}>
          <SettingsScreen
            onBack={handleBackFromSettings}
            onLogout={handleLogout}
          />
        </View>
      )}

      {overlayScreen === 'categoryManagement' && (
        <View style={StyleSheet.absoluteFill}>
          <CategoryManagementScreen onBack={handleBackFromCategoryManagement} />
        </View>
      )}

      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
  },
});
