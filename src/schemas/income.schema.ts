import { z } from 'zod';

export const CreateIncomeSchema = z.object({
   description: z
      .string()
      .trim()
      .min(1, 'A Descrição é obrigatória'),

   amount: z.number().positive('O Valor é obrigatório'),

   expectedDate: z.coerce.date({
      message: "A Data prevista é obrigatória"
   }),

   receivedDate: z.coerce.date().optional().nullable()
});