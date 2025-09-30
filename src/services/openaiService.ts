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
      // Get recent transactions
      const transactions = await database.getTransactions(50);

      // Get category totals
      const categoryTotals = await database.getCategoryTotals();

      // Calculate summary statistics
      const totalSpending = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalIncome = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const avgTransaction = transactions.length > 0
        ? totalSpending / transactions.filter(t => t.amount < 0).length
        : 0;

      // Format category breakdown
      const categoryBreakdown = categoryTotals
        .filter((cat) => cat.total < 0)
        .map((cat) => `${cat.categoryName}: R${Math.abs(cat.total).toFixed(2)} (${cat.count} transactions)`)
        .join('\n');

      // Get recent transaction samples
      const recentTransactions = transactions
        .slice(0, 10)
        .map((t) => `${t.description}: R${t.amount.toFixed(2)} (${t.categoryName || 'Uncategorized'})`)
        .join('\n');

      return `
# User's Financial Summary

## Overview
- Total Spending: R${totalSpending.toFixed(2)}
- Total Income: R${totalIncome.toFixed(2)}
- Average Transaction: R${avgTransaction.toFixed(2)}
- Total Transactions: ${transactions.length}

## Spending by Category
${categoryBreakdown || 'No categorized transactions yet'}

## Recent Transactions (Last 10)
${recentTransactions || 'No transactions yet'}

Use this information to provide personalized financial insights and advice to the user.
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
