import { z } from 'zod';

export const CreateExpenseSchema = z.object({
   description: z
      .string()
      .min(1, 'A Descrição é obrigatória')
      .min(3, 'A Descrição deve ter no mínimo 3 caracteres'),
   category: z.string().min(1, 'A Categoria é obrigatória'),
   amount: z.number().positive('O Valor deve ser positivo'),
   paymentDate: z.string().min(1, 'A Data de pagamento é obrigatória')
});

export type CreateExpense = z.infer<typeof CreateExpenseSchema>;