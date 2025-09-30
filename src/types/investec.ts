export interface InvestecCredentials {
  clientId: string;
  clientSecret: string;
  apiKey: string;
}

export interface InvestecTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  scope: string;
}

export interface InvestecAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  referenceName: string;
  productName: string;
}

export interface InvestecTransaction {
  accountId: string;
  type: string;
  transactionType: string;
  status: string;
  description: string;
  cardNumber: string;
  postedOrder: number;
  postingDate: string;
  valueDate: string;
  actionDate: string;
  transactionDate: string;
  amount: number;
  runningBalance: number;
}

export interface InvestecBalance {
  accountId: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
}
