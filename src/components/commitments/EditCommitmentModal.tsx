import { useEffect, useState } from 'react'
import { updateCommitment, deleteCommitment } from '@/api/endpoints/commitments'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Commitment } from '@/types/Commitment'
import { numberToCurrency, currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'

interface EditCommitmentModalProps {
   isOpen: boolean
   commitment: Commitment | null
   onClose: () => void
   onConfirm: (rowIndex: number) => void
}

/**
 * Modal for editing or settling a commitment.
 * Allows updating the amount and setting the payment date (marking as paid).
 */
export function EditCommitmentModal({ isOpen, commitment, onClose, onConfirm }: EditCommitmentModalProps) {
   const { month, year } = usePeriod()

   const [amount, setAmount] = useState('')
   const [paymentDate, setPaymentDate] = useState('')
   const [isLoading, setIsLoading] = useState(false)
   const [activeAction, setActiveAction] = useState<'saving' | 'deleting' | null>(null)

   /**
    * Pre-fills the form when a commitment is selected.
    * Defaults paymentDate to today for convenience.
    */
   useEffect(() => {
      if (commitment) {
         setAmount(numberToCurrency(commitment.amount))
         // Sugere a data de hoje para o pagamento
         setPaymentDate(new Date().toISOString().slice(0, 10))
      }
   }, [commitment])

   if (!commitment) return null

   /**
    * Updates the commitment (usually to mark as paid).
    */
   async function handleSave() {
      if (!commitment) return;

      setIsLoading(true)
      setActiveAction('saving')
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
         console.error("Failed to update commitment:", error)
      } finally {
         setIsLoading(false)
         setActiveAction(null)
      }
   }

   /**
    * Removes the commitment record.
    */
   async function handleDelete() {
      if (!commitment) return

      setIsLoading(true)
      setActiveAction('deleting')
      try {
         await deleteCommitment(commitment.rowIndex, month, String(year))
         onConfirm(commitment.rowIndex)
         onClose()
      } catch (error) {
         console.error("Failed to delete commitment:", error)
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
         isLoading={isLoading}
         loadingText={activeAction === 'deleting' ? 'Excluindo...' : 'Salvando...'}
         onSave={handleSave}
         onDelete={handleDelete}
      >
         <div className="space-y-4">
            {/* Info Summary */}
            <div className="bg-muted/40 p-3 rounded-lg border border-dashed text-[11px] text-muted-foreground grid grid-cols-2 gap-2">
               <div>
                  Tipo: <span className="font-medium text-foreground">{commitment.type}</span>
               </div>
               <div>
                  Vencimento: <span className="font-medium text-foreground">{commitment.dueDate}</span>
               </div>
               {commitment.card && (
                  <div className="col-span-2">
                     Cartão: <span className="font-medium text-foreground">{commitment.card}</span>
                     {commitment.installment && ` (Parc. ${commitment.installment}/${commitment.totalInstallments})`}
                  </div>
               )}
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                     Confirmar Valor
                  </label>
                  <input
                     className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
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
                     className="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                     value={paymentDate}
                     onChange={e => setPaymentDate(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                     * Preencha para marcar este compromisso como pago.
                  </p>
               </div>
            </div>
         </div>
      </BaseModal>
   )
}