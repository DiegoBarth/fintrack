export interface Commitment {
   rowIndex: number;
   description: string;
   category: string;
   type: 'Fixed' | 'Variable' | 'Credit_card';
   amount: number;
   dueDate: string;
   paymentDate?: string;
   card?: string;
   installments?: number;
   totalInstallments?: number;
}