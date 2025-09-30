export interface Transaction {
  id: number;
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
  categoryId: number | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface TransactionWithCategory extends Transaction {
  categoryName?: string;
  categoryColor?: string;
}

export interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: number;
  count: number;
}
