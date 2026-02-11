import React, { ReactNode } from 'react';

interface Props {
   children: ReactNode;
}

interface State {
   hasError: boolean;
   error: Error | null;
}

/**
 * ErrorBoundary: Component to catch unhandled errors in child components
 * * Description:
 * - Implements React Error Boundary (class components only)
 * - Catches errors in any child component (render, lifecycle, constructors)
 * - Displays fallback UI when an error is caught
 * - Allows the user to reload the application
 * * Limitations (Does NOT catch):
 * - Errors in event handlers (use try/catch)
 * - Asynchronous errors (use .catch() or try/catch in async/await)
 * - Errors during SSR (client-side only)
 * - Errors within the ErrorBoundary itself
 * * Placement:
 * - Should wrap AppProvider in App.tsx (highest possible level)
 * - Multiple ErrorBoundaries can be used for error isolation
 * * @example
 * <ErrorBoundary>
 * <AppProvider>
 * <AppRouter />
 * </AppProvider>
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
   constructor(props: Props) {
      super(props);

      // Initial state: no errors
      this.state = {
         hasError: false,
         error: null
      };
   }

   /**
    * Static lifecycle method called when an error is thrown in a child component
    * * Responsibility: Update state to trigger a new render with fallback UI
    * * Note: Must be a pure static method (no side effects)
    * Use componentDidCatch for logging and side effects
    * * @param error - The error thrown by the child component
    * @returns New partial state
    */
   static getDerivedStateFromError(error: Error): State {
      // Returns new state that triggers the fallback UI render
      return {
         hasError: true,
         error
      };
   }

   /**
    * Lifecycle method called AFTER getDerivedStateFromError
    * * Responsibility: Side effects (logging, error reporting, etc.)
    * * Executed 2x in development (to detect bugs more easily)
    * Executed 1x in production
    * * @param error - The error that was thrown
    * @param errorInfo - Additional information (component stack trace)
    */
   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // Detailed log for debugging
      // In production, you could send this to an error tracking service
      // (e.g., Sentry, LogRocket, etc.)
      console.error('ErrorBoundary capturou um erro:', error, errorInfo);
   }

   render() {
      // If an error occurs, renders the fallback UI
      if (this.state.hasError) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
               <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
                  {/* Visual Icon */}
                  <div className="text-6xl mb-4">⚠️</div>

                  {/* Titles and description */}
                  <h1 className="text-2xl font-bold text-red-600 mb-2">
                     Algo deu errado
                  </h1>
                  <p className="text-gray-600 mb-4">
                     Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página.
                  </p>

                  {/* Collapsible section with technical details */}
                  {/* Useful for debugging, but hides technical details from the end user */}
                  <details className="mb-6 text-left bg-red-50 p-4 rounded border border-red-200">
                     <summary className="cursor-pointer font-semibold text-red-700 mb-2">
                        Detalhes técnicos
                     </summary>
                     <pre className="text-xs text-red-600 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                        {this.state.error?.toString()}
                     </pre>
                  </details>

                  {/* Button to reload the page */}
                  {/* window.location.reload() is more reliable than React Router for this kind of recovery */}
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

      // If no error occurred, renders children normally
      return this.props.children;
   }
}