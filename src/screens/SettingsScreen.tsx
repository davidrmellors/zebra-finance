import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { openaiService } from '../services/openaiService';
import { investecAuth } from '../services/investecAuth';
import { theme } from '../theme/colors';

const OPENAI_KEY = 'openai_api_key';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToCategoryManagement?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout, onNavigateToCategoryManagement }) => {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await SecureStore.getItemAsync(OPENAI_KEY);
      if (savedKey) {
        setHasApiKey(true);
        openaiService.initialize(savedKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      await SecureStore.setItemAsync(OPENAI_KEY, apiKey.trim());
      openaiService.initialize(apiKey.trim());
      setHasApiKey(true);
      setApiKey('');
      Alert.alert('Success', 'OpenAI API key saved successfully!');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save API key'
      );
    }
  };

  const handleRemoveApiKey = async () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your OpenAI API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(OPENAI_KEY);
              setHasApiKey(false);
              Alert.alert('Success', 'API key removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove API key');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <LinearGradient colors={theme.gradients.card} style={styles.section}>
            <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
            <Text style={styles.sectionDescription}>
              Enter your OpenAI API key to enable the AI assistant. You can get an API key from
              platform.openai.com.
            </Text>

            {hasApiKey ? (
              <View style={styles.apiKeyStatus}>
                <Text style={styles.apiKeyStatusText}>✓ API Key Configured</Text>
                <LinearGradient
                  colors={[theme.semantic.error, theme.semantic.errorBright]}
                  style={styles.removeButton}
                >
                  <TouchableOpacity style={styles.buttonInner} onPress={handleRemoveApiKey}>
                    <Text style={styles.removeButtonText}>Remove Key</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="sk-..."
                  placeholderTextColor={theme.text.tertiary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <LinearGradient
                  colors={[theme.accent.primary, theme.accent.secondary]}
                  style={[styles.saveButton, !apiKey.trim() && styles.saveButtonDisabled]}
                >
                  <TouchableOpacity
                    style={styles.buttonInner}
                    onPress={handleSaveApiKey}
                    disabled={!apiKey.trim()}
                  >
                    <Text style={styles.saveButtonText}>Save API Key</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </>
            )}
          </LinearGradient>

          <LinearGradient colors={theme.gradients.card} style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionDescription}>
              Manage your transaction categories. Add custom categories or remove ones you don't need.
            </Text>
            <LinearGradient
              colors={[theme.accent.primary, theme.accent.secondary]}
              style={styles.manageCategoriesButton}
            >
              <TouchableOpacity
                style={styles.buttonInner}
                onPress={onNavigateToCategoryManagement}
              >
                <Text style={styles.manageCategoriesText}>Manage Categories</Text>
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>

          <LinearGradient colors={theme.gradients.card} style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Zebra Finance is an AI-powered personal finance assistant that helps you track and
              understand your spending habits.
            </Text>
            <Text style={styles.aboutText}>
              Built for Investec Q3 2025 Bounty Challenge
            </Text>
          </LinearGradient>

          <LinearGradient colors={theme.gradients.card} style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <LinearGradient
              colors={[theme.semantic.error, theme.semantic.errorBright]}
              style={styles.logoutButton}
            >
              <TouchableOpacity
                style={styles.buttonInner}
                onPress={async () => {
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: async () => {
                          await investecAuth.logout();
                          onLogout();
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border.secondary,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: theme.background.input,
    color: theme.text.primary,
    marginBottom: 12,
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonInner: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  apiKeyStatus: {
    backgroundColor: theme.semantic.success,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.semantic.successBright,
  },
  apiKeyStatusText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  removeButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  removeButtonText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  logoutButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  logoutButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  manageCategoriesButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  manageCategoriesText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
