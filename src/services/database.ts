import * as SQLite from 'expo-sqlite';
import { Transaction, Category, TransactionWithCategory, CategoryTotal } from '../types/database';

const DB_NAME = 'zebra_finance.db';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return;

    this.db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create tables
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        icon TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        card_number TEXT,
        posted_order INTEGER,
        posting_date TEXT,
        value_date TEXT,
        action_date TEXT,
        transaction_date TEXT NOT NULL,
        amount REAL NOT NULL,
        running_balance REAL,
        category_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        UNIQUE(account_id, transaction_date, amount, description)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    `);

    // Insert default categories
    await this.insertDefaultCategories();
  }

  private async insertDefaultCategories() {
    if (!this.db) return;

    const defaultCategories = [
      { name: 'Groceries', color: '#4CAF50', icon: '🛒' },
      { name: 'Dining', color: '#FF9800', icon: '🍽️' },
      { name: 'Transportation', color: '#2196F3', icon: '🚗' },
      { name: 'Entertainment', color: '#E91E63', icon: '🎬' },
      { name: 'Shopping', color: '#9C27B0', icon: '🛍️' },
      { name: 'Bills', color: '#F44336', icon: '📄' },
      { name: 'Healthcare', color: '#00BCD4', icon: '🏥' },
      { name: 'Income', color: '#8BC34A', icon: '💰' },
      { name: 'Other', color: '#607D8B', icon: '📌' },
    ];

    for (const category of defaultCategories) {
      try {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO categories (name, color, icon) VALUES (?, ?, ?)',
          [category.name, category.color, category.icon]
        );
      } catch (error) {
        console.error('Error inserting default category:', error);
      }
    }
  }

  // Transaction operations
  async insertTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT OR REPLACE INTO transactions
       (account_id, type, transaction_type, status, description, card_number,
        posted_order, posting_date, value_date, action_date, transaction_date,
        amount, running_balance, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.accountId,
        transaction.type,
        transaction.transactionType,
        transaction.status,
        transaction.description,
        transaction.cardNumber,
        transaction.postedOrder,
        transaction.postingDate,
        transaction.valueDate,
        transaction.actionDate,
        transaction.transactionDate,
        transaction.amount,
        transaction.runningBalance,
        transaction.categoryId,
      ]
    );

    return result.lastInsertRowId;
  }

  async insertTransactionsBatch(transactions: Omit<Transaction, 'id' | 'createdAt'>[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const transaction of transactions) {
      await this.insertTransaction(transaction);
    }
  }

  async getTransactions(limit?: number, offset?: number): Promise<TransactionWithCategory[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const result = await this.db.getAllAsync<any>(query);

    return result.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      type: row.type,
      transactionType: row.transaction_type,
      status: row.status,
      description: row.description,
      cardNumber: row.card_number,
      postedOrder: row.posted_order,
      postingDate: row.posting_date,
      valueDate: row.value_date,
      actionDate: row.action_date,
      transactionDate: row.transaction_date,
      amount: row.amount,
      runningBalance: row.running_balance,
      categoryId: row.category_id,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color,
    }));
  }

  async getTransactionById(id: number): Promise<TransactionWithCategory | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      `SELECT
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?`,
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      accountId: result.account_id,
      type: result.type,
      transactionType: result.transaction_type,
      status: result.status,
      description: result.description,
      cardNumber: result.card_number,
      postedOrder: result.posted_order,
      postingDate: result.posting_date,
      valueDate: result.value_date,
      actionDate: result.action_date,
      transactionDate: result.transaction_date,
      amount: result.amount,
      runningBalance: result.running_balance,
      categoryId: result.category_id,
      createdAt: result.created_at,
      categoryName: result.category_name,
      categoryColor: result.category_color,
    };
  }

  async updateTransactionCategory(transactionId: number, categoryId: number | null): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE transactions SET category_id = ? WHERE id = ?',
      [categoryId, transactionId]
    );
  }

  async searchTransactions(searchTerm: string): Promise<TransactionWithCategory[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      `SELECT
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.description LIKE ?
      ORDER BY t.transaction_date DESC`,
      [`%${searchTerm}%`]
    );

    return result.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      type: row.type,
      transactionType: row.transaction_type,
      status: row.status,
      description: row.description,
      cardNumber: row.card_number,
      postedOrder: row.posted_order,
      postingDate: row.posting_date,
      valueDate: row.value_date,
      actionDate: row.action_date,
      transactionDate: row.transaction_date,
      amount: row.amount,
      runningBalance: row.running_balance,
      categoryId: row.category_id,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color,
    }));
  }

  async getTransactionsByCategory(categoryId: number): Promise<TransactionWithCategory[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      `SELECT
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.category_id = ?
      ORDER BY t.transaction_date DESC`,
      [categoryId]
    );

    return result.map((row) => ({
      id: row.id,
      accountId: row.account_id,
      type: row.type,
      transactionType: row.transaction_type,
      status: row.status,
      description: row.description,
      cardNumber: row.card_number,
      postedOrder: row.posted_order,
      postingDate: row.posting_date,
      valueDate: row.value_date,
      actionDate: row.action_date,
      transactionDate: row.transaction_date,
      amount: row.amount,
      runningBalance: row.running_balance,
      categoryId: row.category_id,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color,
    }));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>('SELECT * FROM categories ORDER BY name');

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      createdAt: row.created_at,
    }));
  }

  async createCategory(name: string, color: string, icon?: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
      [name, color, icon || null]
    );

    return result.lastInsertRowId;
  }

  async updateCategory(id: number, name: string, color: string, icon?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?',
      [name, color, icon || null, id]
    );
  }

  async deleteCategory(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Set category_id to null for all transactions with this category
    await this.db.runAsync(
      'UPDATE transactions SET category_id = NULL WHERE category_id = ?',
      [id]
    );

    // Delete the category
    await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  }

  // Statistics
  async getCategoryTotals(startDate?: string, endDate?: string): Promise<CategoryTotal[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        SUM(t.amount) as total,
        COUNT(t.id) as count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE t.transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' GROUP BY c.id, c.name, c.color ORDER BY total DESC';

    const result = await this.db.getAllAsync<any>(query, params);

    return result.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      categoryColor: row.category_color,
      total: row.total || 0,
      count: row.count || 0,
    }));
  }

  async getTotalTransactions(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions'
    );

    return result?.count || 0;
  }

  async getTotalIncomeAndSpending(startDate?: string, endDate?: string): Promise<{ totalIncome: number; totalSpending: number }> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT
        SUM(CASE WHEN LOWER(type) = 'credit' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN LOWER(type) = 'debit' THEN ABS(amount) ELSE 0 END) as total_spending
      FROM transactions
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    console.log('getTotalIncomeAndSpending query:', query);
    console.log('getTotalIncomeAndSpending params:', params);

    const result = await this.db.getFirstAsync<any>(query, params);
    console.log('getTotalIncomeAndSpending result:', result);

    return {
      totalIncome: result?.total_income || 0,
      totalSpending: result?.total_spending || 0,
    };
  }

  async clearAllTransactions(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM transactions');
  }
}

export const database = new DatabaseService();
