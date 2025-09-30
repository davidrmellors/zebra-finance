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
import * as SecureStore from 'expo-secure-store';
import { openaiService } from '../services/openaiService';
import { investecAuth } from '../services/investecAuth';

const OPENAI_KEY = 'openai_api_key';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout }) => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
          <Text style={styles.sectionDescription}>
            Enter your OpenAI API key to enable the AI assistant. You can get an API key from
            platform.openai.com.
          </Text>

          {hasApiKey ? (
            <View style={styles.apiKeyStatus}>
              <Text style={styles.apiKeyStatusText}>✓ API Key Configured</Text>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveApiKey}>
                <Text style={styles.removeButtonText}>Remove Key</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-..."
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.saveButton, !apiKey.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveApiKey}
                disabled={!apiKey.trim()}
              >
                <Text style={styles.saveButtonText}>Save API Key</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Zebra Finance is an AI-powered personal finance assistant that helps you track and
            understand your spending habits.
          </Text>
          <Text style={styles.aboutText}>
            Built for Investec Q3 2025 Bounty Challenge
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.logoutButton}
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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  apiKeyStatus: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  apiKeyStatusText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
