import { useToast } from '@/contexts/toast';

interface ApiError {
   statusCode?: number;
   message: string;
   details?: unknown;
}

export function useApiError() {
   const toast = useToast();

   const handleError = (error: unknown) => {
      try {
         // Fetch/Network error
         if (error instanceof TypeError) {
            if (error.message.includes('fetch')) {
               toast.error('Erro de conexão com o servidor');
               return;
            }
         }

         // Response Error (from client API)
         if (error instanceof Error) {
            const message = error.message;

            // Try to extract JSON error
            try {
               const errorObj = JSON.parse(message) as ApiError;
               toast.error(errorObj.message || 'Erro ao processar requisição');
               return;
            } catch {
               // Display the message
               if (message.includes('401') || message.includes('Unauthorized')) {
                  toast.error('Sessão expirada. Faça login novamente');
                  return;
               }
               if (message.includes('403') || message.includes('Forbidden')) {
                  toast.error('Você não tem permissão para realizar esta ação');
                  return;
               }
               if (message.includes('404') || message.includes('Not Found')) {
                  toast.error('Recurso não encontrado');
                  return;
               }
               if (message.includes('500') || message.includes('Internal')) {
                  toast.error('Erro no servidor. Tente novamente mais tarde');
                  return;
               }

               toast.error(message || 'Erro desconhecido');
               return;
            }
         }

         // Generic error
         const errorMessage = String(error);
         toast.error(
            errorMessage || 'Erro ao processar a requisição. Tente novamente'
         );
      } catch (err) {
         console.error('Erro ao processar erro:', err);
         toast.error('Erro desconhecido');
      }
   };

   return { handleError };
}