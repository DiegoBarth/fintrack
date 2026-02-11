import { z } from 'zod';
import { useToast } from '@/contexts/toast';

export function useValidation() {
   const toast = useToast();

   const validate = <T,>(
      schema: z.ZodSchema,
      dados: unknown
   ): T | null => {
      try {
         return schema.parse(dados) as T;
      } catch (erro) {
         if (erro instanceof z.ZodError) {
            erro.issues.forEach(issue => {
               toast.warning(issue.message);
            })
         }
         return null;
      }
   };

   return { validate };
}