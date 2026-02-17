export interface Commitment {
   rowIndex: number;
   description: string;
   category: string;
   type: 'Fixo' | 'Variável' | 'Cartão' | '';
   amount: number | string;
   dueDate: string;
   paymentDate?: string;
   months?: number;
   card?: string;
   installment?: number;
   totalInstallments?: number;
   referenceMonth: string;
}