import { investecApi } from './investecApi';
import { database } from './database';
import { InvestecTransaction } from '../types/investec';
import { secureStorage } from '../utils/secureStorage';

export interface SyncResult {
  success: boolean;
  newTransactions: number;
  totalTransactions: number;
  lastSyncTime?: number;
  error?: string;
}

export class SyncService {
  private static instance: SyncService;
  private isSyncing: boolean = false;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Sync transactions from Investec API to local database
   */
  async syncTransactions(fromDate?: string, toDate?: string): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        newTransactions: 0,
        totalTransactions: 0,
        error: 'Sync already in progress',
      };
    }

    this.isSyncing = true;

    try {
      // Initialize database if not already done
      await database.init();

      // Fetch transactions from Investec
      const investecTransactions = await investecApi.getAllTransactions(fromDate, toDate);

      console.log('=== Investec API Response ===');
      console.log(`Received ${investecTransactions.length} transactions`);

      if (investecTransactions.length > 0) {
        console.log('First transaction sample:', JSON.stringify(investecTransactions[0], null, 2));
      }

      // Validate and sanitize transactions
      const validTransactions: any[] = [];
      const invalidTransactions: any[] = [];

      investecTransactions.forEach((t, index) => {
        // Check for required fields
        const missingFields: string[] = [];

        if (!t.accountId) missingFields.push('accountId');
        if (!t.type) missingFields.push('type');
        if (!t.status) missingFields.push('status');
        if (!t.description) missingFields.push('description');
        if (!t.transactionDate) missingFields.push('transactionDate');
        if (t.amount === undefined || t.amount === null) missingFields.push('amount');

        if (missingFields.length > 0) {
          console.warn(`Transaction ${index} missing fields:`, missingFields);
          console.warn('Transaction data:', JSON.stringify(t, null, 2));
          invalidTransactions.push({ index, transaction: t, missingFields });
        } else {
          // Handle null transactionType - some transactions legitimately don't have this field
          const transactionType = t.transactionType || 'Other';

          if (!t.transactionType) {
            console.log(`Transaction ${index} has null transactionType, using default: "${transactionType}"`);
          }

          validTransactions.push({
            accountId: t.accountId,
            type: t.type,
            transactionType: transactionType,
            status: t.status,
            description: t.description,
            cardNumber: t.cardNumber || '',
            postedOrder: t.postedOrder || 0,
            postingDate: t.postingDate || '',
            valueDate: t.valueDate || '',
            actionDate: t.actionDate || '',
            transactionDate: t.transactionDate,
            amount: t.amount,
            runningBalance: t.runningBalance || 0,
            categoryId: null, // Will be assigned by user
          });
        }
      });

      console.log(`Valid transactions: ${validTransactions.length}`);
      console.log(`Invalid transactions: ${invalidTransactions.length}`);

      if (invalidTransactions.length > 0) {
        console.error('Invalid transactions detected:', invalidTransactions);
      }

      if (validTransactions.length === 0) {
        return {
          success: false,
          newTransactions: 0,
          totalTransactions: 0,
          error: `No valid transactions found. ${invalidTransactions.length} transactions had missing required fields.`,
        };
      }

      // Insert valid transactions into database
      await database.insertTransactionsBatch(validTransactions);

      const totalTransactions = await database.getTotalTransactions();

      // Save the sync timestamp
      const syncTime = Date.now();
      await secureStorage.saveLastSyncTime(syncTime);

      return {
        success: true,
        newTransactions: validTransactions.length,
        totalTransactions,
        lastSyncTime: syncTime,
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        newTransactions: 0,
        totalTransactions: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync transactions from the last 90 days
   */
  async syncRecentTransactions(): Promise<SyncResult> {
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return this.syncTransactions(fromDate, toDate);
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Get the last sync time
   */
  async getLastSyncTime(): Promise<number | null> {
    return await secureStorage.getLastSyncTime();
  }
}

export const syncService = SyncService.getInstance();
