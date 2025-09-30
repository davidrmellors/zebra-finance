import { database } from './database';
import { openaiService } from './openaiService';

export interface FinancialNudge {
  id: string;
  title: string;
  message: string;
  category: 'spending' | 'saving' | 'insight' | 'warning';
  icon: string;
  timestamp: Date;
}

class NudgeService {
  private static instance: NudgeService;

  private constructor() {}

  static getInstance(): NudgeService {
    if (!NudgeService.instance) {
      NudgeService.instance = new NudgeService();
    }
    return NudgeService.instance;
  }

  /**
   * Generate financial nudges based on transaction patterns
   */
  async generateNudges(): Promise<FinancialNudge[]> {
    const nudges: FinancialNudge[] = [];

    try {
      // Get recent transactions (last 30 days)
      const allTransactions = await database.getTransactions();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = allTransactions.filter(
        (t) => new Date(t.transactionDate) >= thirtyDaysAgo
      );

      if (recentTransactions.length === 0) {
        return [
          {
            id: 'no-data',
            title: 'Sync Your Transactions',
            message: 'Sync your Investec transactions to get personalized financial insights!',
            category: 'insight',
            icon: '📊',
            timestamp: new Date(),
          },
        ];
      }

      // Calculate spending metrics
      const totalSpending = recentTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const dailyAverage = totalSpending / 30;

      // Uncategorized transactions nudge
      const uncategorized = recentTransactions.filter((t) => !t.categoryId);
      if (uncategorized.length > 5) {
        nudges.push({
          id: 'uncategorized',
          title: 'Categorize Your Transactions',
          message: `You have ${uncategorized.length} uncategorized transactions. Categorizing helps track spending better!`,
          category: 'insight',
          icon: '🏷️',
          timestamp: new Date(),
        });
      }

      // High spending nudge
      if (dailyAverage > 500) {
        nudges.push({
          id: 'high-spending',
          title: 'High Daily Spending',
          message: `Your average daily spending is R${dailyAverage.toFixed(2)}. Consider reviewing your expenses.`,
          category: 'warning',
          icon: '⚠️',
          timestamp: new Date(),
        });
      }

      // Category-specific insights
      const categoryTotals = await database.getCategoryTotals();
      const topCategory = categoryTotals
        .filter((c) => c.total < 0)
        .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))[0];

      if (topCategory && Math.abs(topCategory.total) > 1000) {
        nudges.push({
          id: 'top-category',
          title: `${topCategory.categoryName} Spending`,
          message: `You've spent R${Math.abs(topCategory.total).toFixed(2)} on ${topCategory.categoryName} this month.`,
          category: 'insight',
          icon: '💰',
          timestamp: new Date(),
        });
      }

      // AI-generated nudge (if OpenAI is configured)
      if (openaiService.isInitialized() && recentTransactions.length > 10) {
        try {
          const aiNudge = await this.generateAINudge(recentTransactions, categoryTotals);
          if (aiNudge) {
            nudges.push(aiNudge);
          }
        } catch (error) {
          console.error('Error generating AI nudge:', error);
        }
      }

      // If no nudges generated, provide a positive message
      if (nudges.length === 0) {
        nudges.push({
          id: 'positive',
          title: 'Great Financial Health!',
          message: 'Your spending looks balanced. Keep up the good work!',
          category: 'insight',
          icon: '✨',
          timestamp: new Date(),
        });
      }

      return nudges;
    } catch (error) {
      console.error('Error generating nudges:', error);
      return [
        {
          id: 'error',
          title: 'Unable to Generate Insights',
          message: 'Please sync your transactions and try again.',
          category: 'insight',
          icon: 'ℹ️',
          timestamp: new Date(),
        },
      ];
    }
  }

  /**
   * Generate an AI-powered financial nudge
   */
  private async generateAINudge(
    transactions: any[],
    categoryTotals: any[]
  ): Promise<FinancialNudge | null> {
    try {
      const totalSpending = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const categoryBreakdown = categoryTotals
        .filter((cat) => cat.total < 0)
        .slice(0, 3)
        .map((cat) => `${cat.categoryName}: R${Math.abs(cat.total).toFixed(2)}`)
        .join(', ');

      const prompt = `Based on this spending data for the last 30 days:
- Total spending: R${totalSpending.toFixed(2)}
- Top categories: ${categoryBreakdown}

Generate a single, concise (max 2 sentences) actionable financial tip or insight for the user. Be specific and helpful. Do not include any greetings or sign-offs, just the tip itself.`;

      const response = await openaiService.sendMessage([
        { role: 'user', content: prompt },
      ]);

      return {
        id: 'ai-insight',
        title: 'AI Financial Tip',
        message: response,
        category: 'insight',
        icon: '🤖',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error generating AI nudge:', error);
      return null;
    }
  }
}

export const nudgeService = NudgeService.getInstance();
