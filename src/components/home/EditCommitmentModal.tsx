import { useState, useEffect } from "react"
import { updateCommitment } from "@/api/commitments"
import { usePeriod } from "@/contexts/PeriodContext"
import { formatCurrency, currencyToNumber } from "@/utils/formatters"
import type { AlertItem } from "@/types/AlertItem"

interface EditCommitmentModalProps {
   isOpen: boolean
   commitment: AlertItem | null
   onClose: () => void
   onConfirm: (rowIndex: number) => void
}

/**
 * Modal to finalize a commitment by providing the actual paid amount and payment date.
 */
export function EditCommitmentModal({
   isOpen,
   commitment,
   onClose,
   onConfirm
}: EditCommitmentModalProps) {
   const { month, year } = usePeriod()

   const [amount, setAmount] = useState<string>('')
   const [paymentDate, setPaymentDate] = useState<string>("")
   const [isSubmitting, setIsSubmitting] = useState(false)

   /**
    * Pre-fills the modal with the commitment's current value and today's date.
    */
   useEffect(() => {
      if (commitment) {
         setAmount(formatCurrency(String(commitment.amount)))
         setPaymentDate(new Date().toISOString().slice(0, 10))
      }
   }, [commitment])

   if (!isOpen || !commitment) return null

   /**
    * Sends the updated payment data to the API.
    */
   async function handleConfirm() {
      if (!commitment) return

      setIsSubmitting(true)
      try {
         await updateCommitment(
            {
               rowIndex: commitment.rowIndex,
               amount: currencyToNumber(amount),
               paymentDate,
            },
            month,
            String(year)
         )
         onConfirm(commitment.rowIndex)
      } catch (error) {
         console.error("Error updating commitment:", error)
         alert("Não foi possível atualizar o pagamento.")
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <div className="fixed inset-0 z-50">
         {/* Backdrop */}
         <div className="absolute inset-0 bg-black/40" onClick={onClose} />

         {/* Bottom Sheet Content */}
         <div className="
            absolute bottom-0 left-0 right-0
            rounded-t-2xl bg-white
            p-4 shadow-xl
         ">
            <h2 className="mb-4 text-lg font-semibold">
               {commitment.description}
            </h2>

            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                     Valor Pago
                  </label>
                  <input
                     type="text"
                     value={amount}
                     onChange={e => setAmount(formatCurrency(e.target.value))}
                     className="mt-1 w-full rounded-md border border-input p-2 focus:ring-2 focus:ring-primary"
                  />
               </div>

               <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                     Data de Pagamento
                  </label>
                  <input
                     type="date"
                     value={paymentDate}
                     onChange={e => setPaymentDate(e.target.value)}
                     className="mt-1 w-full rounded-md border border-input p-2 focus:ring-2 focus:ring-primary"
                  />
               </div>
            </div>

            <div className="mt-6 flex gap-3">
               <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md border p-2 text-sm font-medium hover:bg-muted"
               >
                  Cancelar
               </button>

               <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="
                     flex-1 rounded-md bg-primary p-2
                     text-sm font-medium text-white 
                     disabled:opacity-60 transition-opacity
                  "
               >
                  {isSubmitting ? 'Salvando...' : 'Confirmar'}
               </button>
            </div>
         </div>
      </div>
   )
}