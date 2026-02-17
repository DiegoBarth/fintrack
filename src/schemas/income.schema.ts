import { z } from 'zod';

export const CreateIncomeSchema = z.object({
   description: z
      .string()
      .trim()
      .min(1, 'A Descrição é obrigatória'),

   amount: z.number().positive('O Valor é obrigatório'),

   months: z.number().int().positive().optional().default(1),

   referenceMonth: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mês de referência inválido'),

   expectedDate: z.coerce.date({
      message: "A Data prevista é obrigatória"
   }),

   receivedDate: z.coerce.date().optional().nullable()
});