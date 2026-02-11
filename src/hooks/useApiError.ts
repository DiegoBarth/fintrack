import { useToast } from '@/contexts/toast';

/**
 * Interface for API errors returned by the backend
 */
interface ApiError {
   statusCode?: number;
   message: string;
   details?: unknown;
}

/**
 * Hook to centralize API error handling
 * * Benefits:
 * - Error message consistency throughout the application
 * - Mapping of HTTP codes to Portuguese messages
 * - Handling of different error types (Network, HTTP, JSON)
 * * @example
 * const { handleError } = useApiError();
 * * const mutation = useMutation({
 * mutationFn: createExpense,
 * onError: (error) => handleError(error)
 * });
 */
export function useApiError() {
   const toast = useToast();

   /**
       * Processes different types of errors and displays the appropriate message
       * * Processing Flow:
       * 1. Checks if it is a network/connection error (TypeError containing 'fetch')
       * 2. Attempts to parse message as JSON for a structured ApiError
       * 3. If not JSON, checks for HTTP codes within the string message
       * 4. Returns a generic error if no previous conditions are met
       * * Handled HTTP Codes:
       * - 401: Session expired
       * - 403: No permission
       * - 404: Resource not found
       * - 500: Server error
       * * @param error - Any type of error originating from fetch or mutation
       */
   const handleError = (error: unknown) => {
      try {
         // ===== Network/Connection Error =====
         // Type: TypeError (connection error, timeout, etc.)
         if (error instanceof TypeError) {
            if (error.message.includes('fetch')) {
               toast.error('Erro de conexão com o servidor');
               return;
            }
         }

         // ===== API HTTP/JSON Error =====
         // Type: Error (can be structured as JSON or a string)
         if (error instanceof Error) {
            const message = error.message;

            // Attempts to interpret the message as a structured error JSON
            try {
               const errorObj = JSON.parse(message) as ApiError;
               toast.error(errorObj.message || 'Erro ao processar requisição');
               return;
            } catch {
               // Message is not JSON, process as string with HTTP code

               // ===== Authentication (401) =====
               if (message.includes('401') || message.includes('Unauthorized')) {
                  toast.error('Sessão expirada. Faça login novamente');
                  return;
               }

               // ===== Authorization (403) =====
               if (message.includes('403') || message.includes('Forbidden')) {
                  toast.error('Você não tem permissão para realizar esta ação');
                  return;
               }

               // ===== Not Found (404) =====
               if (message.includes('404') || message.includes('Not Found')) {
                  toast.error('Recurso não encontrado');
                  return;
               }

               // ===== Server Error (500) =====
               if (message.includes('500') || message.includes('Internal')) {
                  toast.error('Erro no servidor. Tente novamente mais tarde');
                  return;
               }

               // Generic error message if no conditions match
               toast.error(message || 'Erro desconhecido');
               return;
            }
         }

         // ===== Fallback =====
         // If it reached here, it's a non-standard error, convert it to a string
         const errorMessage = String(error);
         toast.error(
            errorMessage || 'Erro ao processar a requisição. Tente novamente'
         );
      } catch (err) {
         // Error while processing the error - prevents infinite loop
         console.error('Erro ao processar erro:', err);
         toast.error('Erro desconhecido');
      }
   };

   return { handleError };
}