import { z } from 'zod';

export const CreateIncomeSchema = z.object({
   description: z
      .string()
      .min(1, 'A Descrição é obrigatória')
      .min(3, 'A Descrição deve ter no mínimo 3 caracteres'),
   amount: z.number().positive('O Valor deve ser positivo'),
   expectedDate: z.date().min(1, 'A Data prevista é obrigatória'),
   receivedDate: z.date().optional()
});

export type CreateIncome = z.infer<typeof CreateIncomeSchema>;