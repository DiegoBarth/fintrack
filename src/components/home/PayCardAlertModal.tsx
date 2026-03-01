import { numberToCurrency } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Wallet } from 'lucide-react'

interface Props {
   isOpen: boolean
   cardName: string
   totalAmount: number
   isPaying: boolean
   onClose: () => void
   onPay: () => void | Promise<void>
}

/**
 * Modal to pay the full card statement from alerts.
 * Shows the card name, total amount, and a "Pagar fatura" button.
 */
export function PayCardAlertModal({
   isOpen,
   cardName,
   totalAmount,
   isPaying,
   onClose,
   onPay,
}: Props) {
   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-[70] flex justify-center items-end md:items-center p-0 md:p-4">
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
         />

         <div className="
            relative w-full md:w-[400px]
            bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl
            shadow-2xl flex flex-col overflow-hidden
            animate-in slide-in-from-bottom-10 duration-300
         ">
            <div className="md:hidden flex justify-center pt-3 pb-1">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="p-6 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                     <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-sm text-muted-foreground">Fatura do cartão</p>
                     <p className="text-lg font-bold text-foreground">{cardName}</p>
                  </div>
               </div>

               <p className="text-2xl font-bold text-orange-600">
                  {numberToCurrency(totalAmount)}
               </p>

               <p className="text-sm text-muted-foreground">
                  Ao confirmar, todos os compromissos deste cartão serão marcados como pagos.
               </p>
            </div>

            <div className="p-4 space-y-2 bg-muted/30 border-t">
               <Button
                  onClick={onPay}
                  disabled={isPaying}
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
               >
                  {isPaying ? 'Pagando…' : 'Pagar fatura'}
               </Button>
               <button
                  onClick={onClose}
                  className="
                     w-full py-3
                     bg-white dark:bg-gray-900
                     border border-gray-200 dark:border-gray-700
                     rounded-xl font-bold text-sm
                     hover:bg-gray-50 dark:hover:bg-gray-800
                     transition-colors"
               >
                  Cancelar
               </button>
            </div>
         </div>
      </div>
   )
}
