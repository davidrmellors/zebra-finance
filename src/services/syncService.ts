import { investecApi } from './investecApi';
import { database } from './database';
import { InvestecTransaction } from '../types/investec';

export interface SyncResult {
  success: boolean;
  newTransactions: number;
  totalTransactions: number;
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

      // Insert transactions into database
      const dbTransactions = investecTransactions.map((t) => ({
        accountId: t.accountId,
        type: t.type,
        transactionType: t.transactionType,
        status: t.status,
        description: t.description,
        cardNumber: t.cardNumber,
        postedOrder: t.postedOrder,
        postingDate: t.postingDate,
        valueDate: t.valueDate,
        actionDate: t.actionDate,
        transactionDate: t.transactionDate,
        amount: t.amount,
        runningBalance: t.runningBalance,
        categoryId: null, // Will be assigned by user
      }));

      await database.insertTransactionsBatch(dbTransactions);

      const totalTransactions = await database.getTotalTransactions();

      return {
        success: true,
        newTransactions: investecTransactions.length,
        totalTransactions,
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
}

export const syncService = SyncService.getInstance();
