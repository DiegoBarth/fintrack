export interface Expense {
   rowIndex: number;
   description: string;
   category: string;
   amount: number | string;
   paymentDate: string;
}