export interface FullSummary {
  totalIncomes: number;
  totalExpenses: number;
  totalCommitments: number;

  totalReceivedAmount: number;
  totalPaidExpenses: number;
  totalPaidCommitments: number;

  totalReceivedInMonth: number;
  totalPaidExpensesInMonth: number;
  totalPaidCommitmentsInMonth: number;

  /** Balance from the previous month (incomes - expenses - commitments). Used for cumulative End of Month balance. */
  accumulatedBalanceFromPreviousMonth?: number;

  availableYears: Array<number>
}