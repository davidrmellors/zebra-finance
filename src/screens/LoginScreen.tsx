import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { investecAuth } from '../services/investecAuth';
import { theme } from '../theme/colors';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!clientId.trim() || !clientSecret.trim() || !apiKey.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await investecAuth.login({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        apiKey: apiKey.trim(),
      });

      Alert.alert('Success', 'Logged in successfully!');
      onLoginSuccess();
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Unable to authenticate with provided credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={theme.gradients.primary}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>🦓 Zebra Finance</Text>
            <Text style={styles.subtitle}>Private Banking Intelligence</Text>
          </View>

          <LinearGradient
            colors={theme.gradients.card}
            style={styles.form}
          >
            <Text style={styles.label}>Client ID</Text>
            <TextInput
              style={styles.input}
              value={clientId}
              onChangeText={setClientId}
              placeholder="Enter your Investec Client ID"
              placeholderTextColor={theme.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Client Secret</Text>
            <TextInput
              style={styles.input}
              value={clientSecret}
              onChangeText={setClientSecret}
              placeholder="Enter your Investec Client Secret"
              placeholderTextColor={theme.text.tertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your Investec API Key"
              placeholderTextColor={theme.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <LinearGradient
              colors={[theme.accent.primary, theme.accent.secondary]}
              style={[styles.button, loading && styles.buttonDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={styles.buttonInner}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.text.primary} />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            <Text style={styles.helpText}>
              Get your credentials from the Investec Developer Portal
            </Text>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  form: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border.secondary,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: theme.background.input,
    color: theme.text.primary,
  },
  button: {
    borderRadius: 8,
    marginTop: 24,
    overflow: 'hidden',
  },
  buttonInner: {
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  helpText: {
    textAlign: 'center',
    color: theme.text.tertiary,
    fontSize: 12,
    marginTop: 20,
  },
});
