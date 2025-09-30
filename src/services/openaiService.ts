import OpenAI from 'openai';
import { database } from './database';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Initialize OpenAI client with API key
   */
  initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.client !== null && this.apiKey !== null;
  }

  /**
   * Get financial context from user's transactions
   */
  private async getFinancialContext(): Promise<string> {
    try {
      // Get ALL transactions (not limited to 50)
      const allTransactions = await database.getTransactions();

      // Get category totals
      const categoryTotals = await database.getCategoryTotals();

      // Calculate overall summary statistics
      // Note: Investec stores all amounts as positive. Use 'type' field to determine debit vs credit
      const totalSpending = allTransactions
        .filter((t) => t.type.toLowerCase() === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = allTransactions
        .filter((t) => t.type.toLowerCase() === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      const debitTransactions = allTransactions.filter(t => t.type.toLowerCase() === 'debit');
      const avgTransaction = debitTransactions.length > 0
        ? totalSpending / debitTransactions.length
        : 0;

      // Calculate monthly spending (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const last30DaysTransactions = allTransactions.filter(t =>
        new Date(t.transactionDate) >= thirtyDaysAgo
      );
      const monthlySpending = last30DaysTransactions
        .filter((t) => t.type.toLowerCase() === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate spending by month for trend analysis
      const monthlyBreakdown: { [key: string]: number } = {};
      allTransactions.forEach(t => {
        if (t.type.toLowerCase() === 'debit') {
          const month = new Date(t.transactionDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' });
          monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + t.amount;
        }
      });

      const monthlyTrend = Object.entries(monthlyBreakdown)
        .slice(-6) // Last 6 months
        .map(([month, total]) => `${month}: R${total.toFixed(2)}`)
        .join('\n');

      // Format category breakdown (including uncategorized)
      const categorizedSpending = categoryTotals
        .filter((cat) => cat.count > 0 && cat.total > 0) // Categories with actual spending
        .map((cat) => `${cat.categoryName}: R${cat.total.toFixed(2)} (${cat.count} transactions)`)
        .join('\n');

      // Calculate uncategorized spending from ALL transactions (debits only)
      const uncategorizedTransactions = allTransactions.filter((t) => t.type.toLowerCase() === 'debit' && !t.categoryName);
      const uncategorizedSpending = uncategorizedTransactions.reduce((sum, t) => sum + t.amount, 0);

      const categoryBreakdown = categorizedSpending +
        (uncategorizedSpending > 0 ? `\nUncategorized: R${uncategorizedSpending.toFixed(2)} (${uncategorizedTransactions.length} transactions)` : '');

      // Get recent transaction samples (debits only for spending analysis)
      const recentTransactions = allTransactions
        .filter(t => t.type.toLowerCase() === 'debit')
        .slice(0, 20)
        .map((t) => `${new Date(t.transactionDate).toLocaleDateString('en-ZA')}: ${t.description} - R${t.amount.toFixed(2)} (${t.categoryName || 'Uncategorized'})`)
        .join('\n');

      return `
# User's Financial Summary

## Overview
- Total Spending (All Time): R${totalSpending.toFixed(2)}
- Monthly Spending (Last 30 Days): R${monthlySpending.toFixed(2)}
- Total Income: R${totalIncome.toFixed(2)}
- Average Transaction: R${avgTransaction.toFixed(2)}
- Total Transactions: ${allTransactions.length}

## Monthly Spending Trend (Last 6 Months)
${monthlyTrend || 'No monthly data yet'}

## Spending by Category (All Time)
${categoryBreakdown || 'No transactions yet'}

## Recent Transactions (Last 20)
${recentTransactions || 'No transactions yet'}

Use this information to provide personalized financial insights and advice to the user. You have access to:
- All transaction amounts, dates, descriptions, and categories
- Monthly spending averages and trends
- Category breakdowns (both categorized and uncategorized transactions)

When answering questions about spending, use the actual transaction data provided above. Calculate monthly averages, identify spending patterns, and provide specific insights based on the real data.
`;
    } catch (error) {
      console.error('Error getting financial context:', error);
      return 'No financial data available yet. Please sync your transactions first.';
    }
  }

  /**
   * Send a message to GPT and get a response
   */
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please provide an API key.');
    }

    try {
      // Get financial context
      const context = await this.getFinancialContext();

      // Prepare messages with system context
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `You are Zebra Finance Assistant, an AI financial advisor helping users understand their spending habits and make better financial decisions.

You have access to the user's transaction data and should provide personalized, actionable insights.

Be friendly, concise, and helpful. When discussing money, always use South African Rand (R) as the currency.

${context}`,
      };

      const apiMessages = [
        { role: systemMessage.role, content: systemMessage.content },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: apiMessages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Error sending message to OpenAI:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get response from AI'
      );
    }
  }
}

export const openaiService = OpenAIService.getInstance();
