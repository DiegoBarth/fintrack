import { z } from 'zod';

export const CreateCommitmentSchema = z.object({
   description: z
      .string()
      .min(1, 'A Descrição é obrigatória')
      .min(3, 'A Descrição deve ter no mínimo 3 caracteres'),
   category: z.string().min(1, 'A Categoria é obrigatória'),
   type: z.enum(['Fixo', 'Variável', 'Cartão'], {
      message: 'Tipo inválido'
   }),
   amount: z.number().positive('O Valor deve ser positivo'),
   dueDate: z.string().min(1, 'A Data de vencimento é obrigatória'),
   months: z.number().int().positive().optional().default(1)
});

export const CreateCardCommitmentSchema = z.object({
   description: z
      .string()
      .min(1, 'A Descrição é obrigatória')
      .min(3, 'A Descrição deve ter no mínimo 3 caracteres'),
   category: z.string().min(1, 'A Categoria é obrigatória'),
   type: z.literal('Cartão'),
   card: z.string().min(1, 'O Cartão é obrigatório'),
   amount: z.number().positive('O Valor deve ser positivo'),
   totalInstallments: z
      .number()
      .int('As Parcelas devem ser um número inteiro')
      .positive('As Parcelas devem ser um número positivo'),
   dueDate: z.string().min(1, 'A Data de vencimento é obrigatória')
});

export type CreateCommitment = z.infer<typeof CreateCommitmentSchema>;
export type CreateCardCommitment = z.infer<typeof CreateCardCommitmentSchema>;