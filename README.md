# 🦓 Zebra Finance - AI-Powered Personal Finance Assistant

An Expo-based mobile application for the **Investec Q3 2025 Bounty Challenge (Track 1)** that provides AI-driven financial insights and personalized nudges to help users better understand and manage their spending habits.

## 📋 Overview

Zebra Finance connects to your Investec developer account to sync transactions, categorize spending, and leverage GPT-4 to deliver intelligent financial insights. The app stores all data locally using SQLite for privacy and works entirely offline after initial transaction sync.

## ✨ Key Features

### 🔐 Authentication
- Secure login with Investec developer credentials (Client ID, Client Secret, API Key)
- Credentials stored securely using `expo-secure-store`
- OAuth token management with automatic refresh

### 💳 Transaction Management
- **Automatic Sync**: Pull transactions from Investec API (last 90 days)
- **Local Storage**: SQLite database for fast, offline access
- **Categorization**: Assign custom categories to transactions
- **Search & Filter**: Find transactions quickly
- **Transaction Details**: View comprehensive transaction information

### 🤖 AI Chat Assistant
- **GPT-4 Integration**: Powered by OpenAI's latest model
- **Context-Aware**: AI has access to your transaction data
- **Financial Guidance**: Get personalized advice on spending habits
- **Natural Conversation**: Chat naturally about your finances

### 💡 Smart Financial Nudges
- **Proactive Insights**: AI-generated tips based on spending patterns
- **Category Analysis**: Identify top spending categories
- **Spending Alerts**: Get notified about high daily spending
- **Actionable Advice**: Receive specific recommendations to improve financial health

## 🛠 Tech Stack

- **Frontend**: Expo (React Native) with TypeScript
- **Database**: SQLite (expo-sqlite)
- **AI**: OpenAI GPT-4
- **API**: Investec Programmable Banking API
- **Storage**: Expo Secure Store

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

5. **Setup AI Assistant**:
   - Tap "💬 AI Financial Assistant"
   - When prompted, tap "Open Settings"
   - Enter your OpenAI API key
   - Start chatting with your AI financial advisor!

### Features Walkthrough

#### Transaction Management
- **View All**: Tap "📋 View Transactions" to see your transaction history
- **Categorize**: Tap any transaction to assign a category
- **Search**: Use the search bar to find specific transactions

#### AI Chat
- Ask questions like:
  - "How much did I spend on groceries this month?"
  - "Where can I save money?"
  - "What's my biggest spending category?"
- The AI has full context of your transactions and spending patterns

#### Financial Nudges
- Automatically generated on the home screen
- Updates after each transaction sync
- Provides actionable insights and warnings

## 📁 Project Structure

```
zebra-finance/
├── src/
│   ├── screens/              # UI screens
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── TransactionDetailScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/             # Business logic
│   │   ├── investecAuth.ts   # Investec authentication
│   │   ├── investecApi.ts    # Investec API client
│   │   ├── database.ts       # SQLite operations
│   │   ├── syncService.ts    # Transaction sync
│   │   ├── openaiService.ts  # OpenAI integration
│   │   └── nudgeService.ts   # Financial insights
│   ├── types/                # TypeScript definitions
│   │   ├── investec.ts
│   │   └── database.ts
│   └── utils/                # Utilities
│       └── secureStorage.ts
├── App.tsx                   # Main app component
└── package.json
```

## 🔒 Security & Privacy

- **Local-First**: All transaction data stored locally on device
- **Secure Storage**: Credentials encrypted with expo-secure-store
- **No Backend**: No data sent to external servers (except Investec and OpenAI APIs)
- **API Keys**: Your Investec and OpenAI keys never leave your device

## 🎯 Investec Q3 2025 Bounty - Track 1

This app is built for Track 1: **Smart & Secure Banking**, focusing on:

1. **Personalized Insights**: AI-driven analysis of spending patterns
2. **Actionable Nudges**: Proactive financial recommendations
3. **Data Privacy**: Local storage, no external data sharing
4. **User Experience**: Clean, intuitive interface

## 🐛 Known Limitations

- Currently supports Investec South Africa only
- Requires OpenAI API key (paid service)
- Limited to last 90 days of transactions
- No multi-account aggregation

## 🔮 Future Enhancements

- Budget planning and tracking
- Spending goals and alerts
- Financial health score
- Export reports (PDF, CSV)
- Recurring transaction detection
- Bill reminders
- Multi-bank support

## 📄 License

This project is built for the Investec Q3 2025 Bounty Challenge.

## 👨‍💻 Author

Built with ❤️ for the Investec Developer Community

## 🙏 Acknowledgments

- Investec for the Programmable Banking API
- OpenAI for GPT-4
- Expo team for the amazing framework
- React Native community

---

**Note**: This app requires developer credentials from Investec and is intended for use by developers participating in the Investec Programmable Banking community.
