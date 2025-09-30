import axios from 'axios';
import { encode as base64Encode } from 'base-64';
import { InvestecCredentials, InvestecTokenResponse } from '../types/investec';
import { secureStorage } from '../utils/secureStorage';

const BASE_URL = 'https://openapi.investec.com';
const TOKEN_URL = `${BASE_URL}/identity/v2/oauth2/token`;

export class InvestecAuthService {
  private static instance: InvestecAuthService;
  private currentToken: string | null = null;

  private constructor() {}

  static getInstance(): InvestecAuthService {
    if (!InvestecAuthService.instance) {
      InvestecAuthService.instance = new InvestecAuthService();
    }
    return InvestecAuthService.instance;
  }

  /**
   * Save credentials and obtain initial access token
   */
  async login(credentials: InvestecCredentials): Promise<void> {
    // Validate credentials by attempting to get token
    const token = await this.fetchAccessToken(credentials);

    // If successful, save credentials
    await secureStorage.saveCredentials(credentials);
    await secureStorage.saveAccessToken(token.access_token, parseInt(token.expires_in));
    this.currentToken = token.access_token;
  }

  /**
   * Clear stored credentials and logout
   */
  async logout(): Promise<void> {
    await secureStorage.deleteCredentials();
    this.currentToken = null;
  }

  /**
   * Get a valid access token (refreshes if expired)
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    const cachedToken = await secureStorage.getAccessToken();
    if (cachedToken) {
      this.currentToken = cachedToken;
      return cachedToken;
    }

    // Get stored credentials
    const credentials = await secureStorage.getCredentials();
    if (!credentials) {
      throw new Error('No credentials stored. Please login first.');
    }

    // Fetch new token
    const tokenResponse = await this.fetchAccessToken(credentials);
    await secureStorage.saveAccessToken(tokenResponse.access_token, parseInt(tokenResponse.expires_in));
    this.currentToken = tokenResponse.access_token;

    return tokenResponse.access_token;
  }

  /**
   * Fetch access token from Investec API
   */
  private async fetchAccessToken(credentials: InvestecCredentials): Promise<InvestecTokenResponse> {
    const basicAuth = base64Encode(
      `${credentials.clientId}:${credentials.clientSecret}`
    );

    try {
      const response = await axios.post<InvestecTokenResponse>(
        TOKEN_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'x-api-key': credentials.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return secureStorage.isAuthenticated();
  }
}

export const investecAuth = InvestecAuthService.getInstance();
