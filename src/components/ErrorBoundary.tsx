import React, { ReactNode } from 'react';

interface Props {
   children: ReactNode;
}

interface State {
   hasError: boolean;
   error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
   constructor(props: Props) {
      super(props);
      this.state = {
         hasError: false,
         error: null
      };
   }

   static getDerivedStateFromError(error: Error): State {
      return {
         hasError: true,
         error
      };
   }

   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('ErrorBoundary capturou um erro:', error, errorInfo);
   }

   render() {
      if (this.state.hasError) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
               <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h1 className="text-2xl font-bold text-red-600 mb-2">
                     Algo deu errado
                  </h1>
                  <p className="text-gray-600 mb-4">
                     Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página.
                  </p>
                  <details className="mb-6 text-left bg-red-50 p-4 rounded border border-red-200">
                     <summary className="cursor-pointer font-semibold text-red-700 mb-2">
                        Detalhes técnicos
                     </summary>
                     <pre className="text-xs text-red-600 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                        {this.state.error?.toString()}
                     </pre>
                  </details>
                  <button
                     onClick={() => window.location.reload()}
                     className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                     Recarregar página
                  </button>
               </div>
            </div>
         );
      }

      return this.props.children;
   }
}