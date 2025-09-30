import axios from 'axios';
import { InvestecAccount, InvestecTransaction, InvestecBalance } from '../types/investec';
import { investecAuth } from './investecAuth';

const BASE_URL = 'https://openapi.investec.com/za/pb/v1';

export class InvestecApiService {
  private static instance: InvestecApiService;

  private constructor() {}

  static getInstance(): InvestecApiService {
    if (!InvestecApiService.instance) {
      InvestecApiService.instance = new InvestecApiService();
    }
    return InvestecApiService.instance;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await investecAuth.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<InvestecAccount[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get<{ data: { accounts: InvestecAccount[] } }>(
        `${BASE_URL}/accounts`,
        { headers }
      );

      return response.data.data.accounts;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch accounts: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<InvestecBalance> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get<{ data: InvestecBalance }>(
        `${BASE_URL}/accounts/${accountId}/balance`,
        { headers }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch balance: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get transactions for an account with automatic pagination
   */
  async getTransactions(
    accountId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<InvestecTransaction[]> {
    try {
      const headers = await this.getHeaders();
      const allTransactions: InvestecTransaction[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // Fetch all pages
      do {
        let url = `${BASE_URL}/accounts/${accountId}/transactions`;

        const params: string[] = [];
        if (fromDate) params.push(`fromDate=${fromDate}`);
        if (toDate) params.push(`toDate=${toDate}`);
        params.push(`page=${currentPage}`);

        url += `?${params.join('&')}`;

        const response = await axios.get<{
          data: { transactions: InvestecTransaction[] };
          meta?: { totalPages?: number };
        }>(url, { headers });

        const transactions = response.data.data.transactions || [];
        allTransactions.push(...transactions);

        // Check if there are more pages
        if (response.data.meta?.totalPages) {
          totalPages = response.data.meta.totalPages;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      return allTransactions;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch transactions: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get all transactions from all accounts
   */
  async getAllTransactions(fromDate?: string, toDate?: string): Promise<InvestecTransaction[]> {
    const accounts = await this.getAccounts();
    const allTransactions: InvestecTransaction[] = [];

    for (const account of accounts) {
      try {
        const transactions = await this.getTransactions(account.accountId, fromDate, toDate);
        allTransactions.push(...transactions);
      } catch (error) {
        console.error(`Error fetching transactions for account ${account.accountId}:`, error);
      }
    }

    return allTransactions;
  }
}

export const investecApi = InvestecApiService.getInstance();
