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

   availableYears: Array<number>
}