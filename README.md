# 🦓 Zebra Finance - AI-Powered Personal Finance Assistant

An Expo-based mobile application for the **Investec Q3 2025 Bounty Challenge (Track 1)** that provides AI-driven financial insights and personalized nudges to help users better understand and manage their spending habits.

## 📋 Overview

Zebra Finance connects to your Investec developer account to sync transactions, categorize spending, and leverage GPT-4o to deliver intelligent financial insights. The app stores all data locally using SQLite for privacy and works entirely offline after initial transaction sync.

## ✨ Key Features

### 🔐 Authentication
- Secure login with Investec developer credentials (Client ID, Client Secret, API Key)
- Credentials stored securely using `expo-secure-store`
- OAuth token management with automatic refresh

### 💳 Transaction Management
- **Automatic Sync**: Pull transactions from Investec API (last 90 days)
- **Local Storage**: SQLite database with indexed queries for fast, offline access
- **Smart Categorization**: 9 default categories with custom category creation support
- **Advanced Filtering**: Filter by transaction type (debit/credit) and category
- **Search**: Find transactions by description
- **Detailed View**: Comprehensive transaction information with category assignment
- **Transaction Validation**: Robust data validation and error handling during sync

### 🤖 AI Chat Assistant
- **GPT-4o Integration**: Powered by OpenAI's latest model
- **Full Context Awareness**: AI has access to all your transaction history, spending trends, and category breakdowns
- **Comprehensive Analysis**:
  - All-time and monthly spending summaries
  - 6-month spending trend analysis
  - Category-wise breakdown with transaction counts
  - Recent transaction samples for context
- **Financial Guidance**: Get personalized advice based on your actual spending data
- **Natural Conversation**: Chat naturally about your finances with markdown-formatted responses

### 📊 Category Analytics
- **Visual Breakdown**: See spending distribution across categories
- **Salary Tracking**: Set your pay day to track spending cycles
- **Transaction Filtering**: Tap any category to view filtered transactions
- **Category Management**: Create, edit, and delete custom categories with colors and emojis
- **Spending Insights**: View total spending and transaction count per category

### 💡 Smart Financial Nudges
- **AI-Generated Insights**: Personalized tips based on 30-day spending patterns
- **Uncategorized Transaction Alerts**: Reminders to categorize transactions
- **High Spending Warnings**: Daily average spending alerts (>R500/day)
- **Top Category Insights**: Breakdown of your highest spending categories
- **Positive Reinforcement**: Encouraging messages for balanced spending

### 💰 Real-Time Balance
- **Live Account Balance**: View current and available balance from Investec
- **Multi-Currency Support**: Automatic currency display
- **Auto-Refresh**: Balance updates after transaction sync

## 🛠 Tech Stack

- **Frontend**: Expo ~54.0 (React Native 0.81) with TypeScript 5.9
- **Navigation**: React Navigation 7 with Bottom Tabs
- **Database**: SQLite (expo-sqlite ~16.0) with async API
- **AI**: OpenAI GPT-4o
- **API**: Investec Programmable Banking API
- **Storage**: Expo Secure Store ~15.0 for credentials
- **UI**:
  - Expo Linear Gradient for visual polish
  - React Native Markdown Display for formatted chat responses
  - Custom theme system with gradients and semantic colors

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- Investec Developer Account ([sign up here](https://developer.investec.com))
- OpenAI API Key ([get one here](https://platform.openai.com))

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zebra-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 🚀 Usage

### First Time Setup

1. **Launch the app** and you'll see the login screen

2. **Get your Investec credentials**:
   - Go to [Investec Developer Portal](https://developer.investec.com)
   - Navigate to your API keys section
   - Copy your Client ID, Client Secret, and API Key

3. **Login**: Enter your Investec credentials

4. **Sync Transactions**:
   - Tap "🔄 Sync Transactions" on the home screen
   - The app will fetch your last 90 days of transactions

5. **Setup AI Assistant** (Optional):
   - Tap the "Settings" tab
   - Enter your OpenAI API key in the provided field
   - Go to "AI Chat" tab
   - Start chatting with your AI financial advisor!
   - Note: Chat features work without OpenAI, but AI-generated insights require an API key

### App Navigation

The app uses a **5-tab bottom navigation** structure:
1. **Home** 🏠 - Dashboard with balance, sync, and financial nudges
2. **Txns** 📋 - Transaction list with filtering and search
3. **AI Chat** 💬 - Chat with AI financial assistant
4. **Categories** 📊 - Category analytics and management
5. **Settings** ⚙️ - OpenAI API configuration and logout

### Features Walkthrough

#### Home Screen
- **Account Balance**: View your current and available balance
- **Transaction Counter**: See total synced transactions
- **Sync Button**: Pull latest transactions from Investec
- **Financial Insights**: AI-generated nudges and spending alerts
- **Last Sync Timestamp**: Track when you last synced

#### Transaction Management
- **View All**: Browse your complete transaction history
- **Filter & Search**:
  - Filter by transaction type (All, Debit, Credit)
  - Filter by category
  - Search by description
- **Categorize**: Tap any transaction to assign or change its category
- **Detailed View**: See full transaction details including dates, amounts, and running balance

#### AI Chat
- Ask questions like:
  - "How much did I spend on groceries this month?"
  - "What's my spending trend over the last 6 months?"
  - "Where can I save money?"
  - "What's my biggest spending category?"
  - "Show me my uncategorized transactions"
- The AI analyzes:
  - All transaction history (not just recent)
  - Monthly spending trends
  - Category-wise breakdowns
  - Both categorized and uncategorized transactions
- Responses formatted in markdown for easy reading

#### Category Analytics
- **Visual Overview**: See all categories with spending totals
- **Default Categories**: 9 pre-configured categories (Groceries 🛒, Dining 🍽️, Transportation 🚗, Entertainment 🎬, Shopping 🛍️, Bills 📄, Healthcare 🏥, Income 💰, Other 📌)
- **Custom Categories**: Create unlimited custom categories with personalized colors and emoji icons
- **Salary Tracking**: Configure your pay day to track spending cycles
- **Quick Navigation**: Tap any category to view its transactions in the Transactions tab
- **Category Management**: Edit category names, colors, icons, or delete categories (transactions remain, just uncategorized)

#### Financial Nudges
- Automatically generated on the home screen based on:
  - 30-day spending patterns
  - Uncategorized transaction count
  - Daily spending averages
  - Top spending categories
  - AI-powered insights (when OpenAI is configured)
- Updates after each transaction sync
- Color-coded by priority (warning, insight, saving, spending)

## 📁 Project Structure

```
zebra-finance/
├── src/
│   ├── screens/                    # UI screens (8 total)
│   │   ├── LoginScreen.tsx         # Investec credential authentication
│   │   ├── HomeScreen.tsx          # Dashboard with balance, stats, nudges
│   │   ├── TransactionsScreen.tsx  # Transaction list with filtering/search
│   │   ├── TransactionDetailScreen.tsx  # Individual transaction view
│   │   ├── ChatScreen.tsx          # AI assistant interface
│   │   ├── CategoriesScreen.tsx    # Category analytics & management
│   │   ├── CategoryManagementScreen.tsx  # Create/edit categories
│   │   └── SettingsScreen.tsx      # App settings & OpenAI config
│   ├── navigation/
│   │   └── MainTabs.tsx            # Bottom tab navigation
│   ├── services/                   # Business logic layer
│   │   ├── investecAuth.ts         # OAuth token management
│   │   ├── investecApi.ts          # Investec API client (accounts, transactions, balance)
│   │   ├── database.ts             # SQLite operations (transactions, categories)
│   │   ├── syncService.ts          # Transaction sync with validation
│   │   ├── openaiService.ts        # GPT-4o chat with full context
│   │   └── nudgeService.ts         # Financial insight generation
│   ├── types/                      # TypeScript definitions
│   │   ├── investec.ts             # Investec API types
│   │   └── database.ts             # Database schema types
│   ├── utils/
│   │   └── secureStorage.ts        # Expo SecureStore wrapper
│   ├── constants/
│   │   └── storage.ts              # Storage keys
│   └── theme/
│       └── colors.ts               # App-wide color theme & gradients
├── assets/                         # App icons and images
├── App.tsx                         # Root component with navigation setup
├── index.ts                        # Entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

## 🔒 Security & Privacy

- **Local-First Architecture**: All transaction data stored locally on device in SQLite
- **Secure Credential Storage**: Investec and OpenAI credentials encrypted with `expo-secure-store`
- **No Backend Server**: No data sent to external servers (except Investec and OpenAI APIs)
- **API Keys**: Your Investec and OpenAI keys stored securely on device only
- **Data Validation**: Transaction data validated and sanitized before database insertion
- **Offline-First**: App fully functional offline after initial sync

## 🎯 Investec Q3 2025 Bounty - Track 1

This app is built for Track 1: **Smart & Secure Banking**, focusing on:

1. **Personalized AI Insights**: GPT-4o analyzes your complete transaction history, spending trends, and category breakdowns to provide tailored financial advice
2. **Proactive Financial Nudges**: Automatic insights based on 30-day patterns, uncategorized transactions, high spending alerts, and AI-generated tips
3. **Data Privacy**: Local-first SQLite storage with encrypted credentials - no backend server
4. **User Experience**: Modern gradient UI with bottom tab navigation, markdown-formatted responses, and intuitive category management
5. **Real-Time Banking**: Live account balance integration with automatic refresh

## 🏗️ Architecture Highlights

- **Separation of Concerns**: Clear separation between UI (screens), business logic (services), and data (database)
- **Type Safety**: Full TypeScript coverage with strict typing across all layers
- **Async Database**: Uses modern async SQLite API (`expo-sqlite ~16.0`) for non-blocking operations
- **Database Features**:
  - Indexed queries on `transaction_date`, `category_id`, and `account_id` for fast lookups
  - Unique constraint on transactions to prevent duplicates during sync
  - Foreign key relationships between transactions and categories
  - Batch insert operations for efficient syncing
  - Built-in aggregation queries for category totals and spending summaries
- **Error Handling**: Robust error handling throughout with user-friendly alerts and console logging
- **State Management**: React hooks for local state, AsyncStorage for app preferences (salary day, etc.)
- **Navigation**: Modal-based overlays for transaction details and settings to preserve main navigation state
- **OpenAI Integration**: Context-aware AI with full transaction history, spending trends, and category breakdowns

## 🐛 Known Limitations

- Currently supports Investec South Africa only
- Requires OpenAI API key (paid service) for AI chat features
- Limited to last 90 days of transactions per sync
- Single account view (first account used if multiple exist)
- No transaction export functionality yet
- Nudges limited to 30-day analysis window

## 🔮 Future Enhancements

- **Budget Planning**: Set monthly budgets per category with alerts
- **Spending Goals**: Track progress toward savings goals
- **Financial Health Score**: Algorithmic score based on spending habits
- **Export Reports**: Generate PDF/CSV reports of transactions and insights
- **Recurring Transaction Detection**: Automatically identify subscriptions and bills
- **Bill Reminders**: Notifications for upcoming recurring payments
- **Multi-Bank Support**: Aggregate transactions from multiple banks
- **Split Transactions**: Assign multiple categories to a single transaction
- **Merchant Recognition**: Auto-categorize based on merchant history
- **Custom Nudge Rules**: User-defined triggers for personalized alerts

## 📄 License

This project is built for the Investec Q3 2025 Bounty Challenge.

## 👨‍💻 Author

David Mellors

## 🙏 Acknowledgments

- Investec for the Programmable Banking API
- OpenAI for GPT-4
- Expo team for the amazing framework
- React Native community

---

**Note**: This app requires developer credentials from Investec and is intended for use by developers participating in the Investec Programmable Banking community.
