import { z } from 'zod';
import { useToast } from '@/contexts/toast';

/**
 * Hook for data validation using Zod schemas
 * * Responsibilities:
 * - Validates data against a Zod schema
 * - Displays validation errors as toast warnings
 * - Returns typed data or null in case of error
 * * @example
 * const { validate } = useValidation();
 * const data = validate(ExpenseSchema, { description: '', value: 100 });
 * if (!data) return; // Error has already been displayed
 */
export function useValidation() {
   const toast = useToast();

   /**
    * Validates data against a Zod schema
    * * Behavior:
    * - On success: returns data typed as <T>
    * - On error: displays each error as a toast warning and returns null
    * - Each error is displayed individually for better UX
    * * @template T - Expected type after successful validation
    * @param schema - Zod schema for validation
    * @param data - Data to be validated (any type)
    * @returns Typed validated data or null if there are errors
    */
   const validate = <T,>(
      schema: z.ZodSchema,
      dados: unknown
   ): T | null => {
      try {
         // Attempts to parse the data against the schema
         return schema.parse(dados) as T;
      } catch (erro) {
         // If it's a Zod error, displays all errors found
         if (erro instanceof z.ZodError) {
            // Iterates over each issue (error) and displays it as a warning
            // Each error is shown separately in a toast
            erro.issues.forEach(issue => {
               toast.warning(issue.message);
            })
         }
         return null;
      }
   };

   return { validate };
}