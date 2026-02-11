export interface Commitment {
   rowIndex: number;
   description: string;
   category: string;
   type: 'Fixed' | 'Variable' | 'Credit_card' | '';
   amount: number | string;
   dueDate: string;
   paymentDate?: string;
   months?: number;
   card?: string;
   installment?: number;
   totalInstallments?: number;
}