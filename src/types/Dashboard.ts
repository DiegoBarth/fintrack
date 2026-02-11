export interface Dashboard {
  monthlyBalance: MonthlyBalanceHistory[];
  topCategories: CategorySummary[];
  cardsSummary: CreditCardSummary[];
}

export interface CreditCardSummary {
   cardName: string;
   image: string;
   totalLimit: number;
   availableLimit: number;
   usedPercentage: number;
   statementTotal: number;
}

export interface CategorySummary {
   category: string;
   total: number;
}

export interface MonthlyBalanceHistory {
   date: string;
   balance: number;
}