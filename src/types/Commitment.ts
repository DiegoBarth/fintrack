export interface Commitment {
   rowIndex: number;
   description: string;
   category: string;
   type: 'Fixed' | 'Variable' | 'Credit_card';
   amount: number;
   dueDate: string;
   paymentDate?: string;
   paid: boolean;
   card?: string;
   installment?: number;
   totalInstallments?: number;
}