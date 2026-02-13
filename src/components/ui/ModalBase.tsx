import { useEffect } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface BaseModalProps {
   isOpen: boolean
   onClose: () => void
   title?: string
   children: React.ReactNode
   type: 'create' | 'edit'
   onSave?: () => void
   onDelete?: () => void
   isLoading?: boolean
   loadingText?: string
}

/**
 * Base modal with full accessibility.
 * * a11y Features:
 * - ARIA attributes (role, aria-modal, aria-labelledby)
 * - Focus trap (Tab cycles only within the modal)
 * - Escape key to close
 * - Screen reader friendly
 * - Restores focus on close
 * * WCAG 2.1 compliant: 2.1.2, 2.4.3, 4.1.2
 */
export function BaseModal({
   isOpen,
   onClose,
   title,
   children,
   type,
   onSave,
   onDelete,
   isLoading = false,
   loadingText = 'Salvando...'
}: BaseModalProps) {
   const trapRef = useFocusTrap(isOpen)

   // Closes modal with Escape key (a11y)
   useEffect(() => {
      if (!isOpen) return

      function handleEscape(e: KeyboardEvent) {
         if (e.key === 'Escape' && !isLoading) {
            onClose()
         }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
   }, [isOpen, isLoading, onClose])

   if (!isOpen) return null

   return (
      <div
         className="fixed inset-0 z-50 flex justify-center items-end md:items-center"
         role="dialog"
         aria-modal="true"
         aria-labelledby={title ? 'modal-titulo' : undefined}
      >
         {/* Overlay / Backdrop */}
         <div
            className="absolute inset-0 bg-black/40 dark:bg-black/70"
            onClick={isLoading ? undefined : onClose}
         />

         {/* Container com focus trap */}
         <div
            ref={trapRef}
            className="relative w-full md:w-[400px] max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl flex flex-col"
         >
            {/* Header */}
            {title && (
               <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                  <h2 id="modal-titulo" className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                  <button
                     onClick={isLoading ? undefined : onClose}
                     disabled={isLoading}
                     aria-label="Fechar modal"
                     className={`text-sm text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300 transition
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     Fechar
                  </button>
               </div>
            )}

            {/* Scrollable Content Area */}
            <div className="px-6 pb-6 pt-4 overflow-y-auto flex-1">{children}</div>
            {/* Smart Footer Actions */}
            <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex-shrink-0">
               <button
                  onClick={onClose}
                  disabled={isLoading}
                  aria-label="Cancelar e fechar modal"
                  className={`
                     flex-1 rounded-lg p-2 text-sm font-medium
                     border border-gray-600
                     text-gray-300
                     bg-gray-800
                     hover:bg-gray-700
                     hover:scale-105 transition-all duration-200
                     transition-all duration-200
                     active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                  `}
               >
                  Cancelar
               </button>

               {type === 'edit' && onDelete && (
                  <button
                     onClick={onDelete}
                     type="button"
                     disabled={isLoading}
                     aria-label="Excluir registro permanentemente"
                     className={`
                        flex-1 rounded-lg p-2 text-sm font-medium
                        bg-rose-600
                        hover:bg-rose-700
                        hover:scale-105 transition-all duration-200
                        text-white
                        transition-all duration-200
                        active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                     `}
                  >
                     {isLoading && loadingText === 'Excluindo...' ? 'Excluindo...' : 'Excluir'}
                  </button>
               )}

               {onSave && (
                  <button
                     onClick={onSave}
                     aria-label={type === 'create' ? 'Salvar novo registro' : 'Salvar alterações'}
                     type="button"
                     disabled={isLoading}
                     className={`
                        flex-1 rounded-lg p-2 text-sm font-medium
                        bg-emerald-600
                        hover:bg-emerald-700
                        hover:scale-105 transition-all duration-200
                        text-white
                        shadow-md shadow-emerald-900/20
                        transition-all duration-200
                        active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                     `}
                  >
                     {isLoading && loadingText !== 'Excluindo...' ? loadingText : 'Salvar'}
                  </button>
               )}
            </div>
         </div>
      </div>
   )
}