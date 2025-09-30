import * as SecureStore from 'expo-secure-store';
import { InvestecCredentials } from '../types/investec';

const CREDENTIALS_KEY = 'investec_credentials';
const ACCESS_TOKEN_KEY = 'investec_access_token';
const TOKEN_EXPIRY_KEY = 'investec_token_expiry';
const LAST_SYNC_KEY = 'last_sync_time';

export const secureStorage = {
  async saveCredentials(credentials: InvestecCredentials): Promise<void> {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials));
  },

  async getCredentials(): Promise<InvestecCredentials | null> {
    const data = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    return data ? JSON.parse(data) : null;
  },

  async deleteCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
  },

  async saveAccessToken(token: string, expiresIn: number): Promise<void> {
    const expiryTime = Date.now() + expiresIn * 1000;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString());
  },

  async getAccessToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const expiry = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) return null;

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= parseInt(expiry) - 300000) {
      return null;
    }

    return token;
  },

  async isAuthenticated(): Promise<boolean> {
    const credentials = await this.getCredentials();
    return credentials !== null;
  },

  async saveLastSyncTime(timestamp: number): Promise<void> {
    await SecureStore.setItemAsync(LAST_SYNC_KEY, timestamp.toString());
  },

  async getLastSyncTime(): Promise<number | null> {
    const timestamp = await SecureStore.getItemAsync(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp) : null;
  }
};
