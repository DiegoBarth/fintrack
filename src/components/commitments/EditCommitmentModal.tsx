import { useState, useEffect } from "react"
import { updateCommitment } from "@/api/commitments"
import { usePeriod } from "@/contexts/PeriodContext"
import { formatCurrency, currencyToNumber } from "@/utils/formatters"
import { BaseModal } from "../ui/ModalBase"
import type { AlertItem } from "@/types/AlertItem"

interface EditCommitmentModalProps {
   isOpen: boolean
   commitment: AlertItem | null
   onClose: () => void
   onConfirm: (rowIndex: number) => void
}

/**
 * Modal to confirm and pay a commitment.
 * Pre-fills the current date as the payment date for convenience.
 */
export function EditCommitmentModal({
   isOpen,
   commitment,
   onClose,
   onConfirm
}: EditCommitmentModalProps) {
   const { month, year } = usePeriod()

   const [amount, setAmount] = useState<string>("")
   const [paymentDate, setPaymentDate] = useState<string>("")
   const [isLoading, setIsLoading] = useState(false)
   const [activeAction, setActiveAction] = useState<'confirming' | null>(null)

   /**
    * Pre-populates the form when a commitment is selected.
    * Defaults paymentDate to today's ISO string (YYYY-MM-DD).
    */
   useEffect(() => {
      if (commitment) {
         setAmount(formatCurrency(String(commitment.amount)))
         setPaymentDate(new Date().toISOString().slice(0, 10))
      }
   }, [commitment])

   if (!commitment) return null

   /**
    * Submits the payment data to the API and triggers the success callback.
    */
   async function handleConfirmPayment() {
      if (!commitment) return;

      setIsLoading(true)
      setActiveAction('confirming')

      try {
         await updateCommitment(
            {
               rowIndex: commitment.rowIndex,
               amount: currencyToNumber(amount),
               paymentDate
            },
            month,
            String(year)
         )

         onConfirm(commitment.rowIndex)
         onClose()
      } catch (error) {
         console.error("Failed to confirm commitment payment:", error)
         alert("Ocorreu um erro ao confirmar o pagamento.")
      } finally {
         setIsLoading(false)
         setActiveAction(null)
      }
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={commitment.description}
         type="edit"
         onSave={handleConfirmPayment}
         isLoading={isLoading}
         loadingText={activeAction === 'confirming' ? 'Confirmando...' : 'Salvar'}
      >
         <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
               Confirme os detalhes abaixo para marcar este compromisso como pago.
            </p>

            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor Pago
               </label>
               <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
               />
            </div>

            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de Pagamento
               </label>
               <input
                  type="date"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
               />
            </div>
         </div>
      </BaseModal>
   )
}