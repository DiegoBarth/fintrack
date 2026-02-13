import { z } from 'zod';

export const CreateCommitmentSchema = z.object({
   description: z
      .string()
      .trim()
      .min(1, 'A Descrição é obrigatória'),

   category: z.string().min(1, 'A Categoria é obrigatória'),

   type: z.enum(['Fixo', 'Variável', 'Cartão'], {
      message: 'O Tipo é obrigatório'
   }),

   amount: z.number().positive('O Valor é obrigatório'),

   months: z.number().int().positive().optional().default(1),

   dueDate: z.coerce.date({
      message: "A Data de vencimento é obrigatória"
   })
});

export const CreateCardCommitmentSchema = z.object({
   description: z
      .string()
      .trim()
      .min(1, 'A Descrição é obrigatória'),

   category: z.string().min(1, 'A Categoria é obrigatória'),

   type: z.literal('Cartão'),

   card: z.string().min(1, 'O Cartão é obrigatório'),

   amount: z.number().positive('O Valor é obrigatório'),

   totalInstallments: z
      .number()
      .int('As Parcelas devem ser um número inteiro')
      .positive('As Parcelas devem ser um número positivo'),

   dueDate: z.coerce.date({
      message: "A Data de vencimento é obrigatória",
   })
});

export type CreateCommitment = z.infer<typeof CreateCommitmentSchema>;
export type CreateCardCommitment = z.infer<typeof CreateCardCommitmentSchema>;