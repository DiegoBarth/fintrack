import { z } from 'zod';

export const CreateExpenseSchema = z.object({
   description: z
      .string()
      .trim()
      .min(1, 'A Descrição é obrigatória'),

   amount: z.number().positive('O Valor é obrigatório'),

   category: z.string().min(1, 'A Categoria é obrigatória'),

   paymentDate: z.coerce.date({
      message: "A Data de pagamento é obrigatória"
   })
});

export type CreateExpense = z.infer<typeof CreateExpenseSchema>;