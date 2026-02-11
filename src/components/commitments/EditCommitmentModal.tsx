import { useEffect, useState } from 'react'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Commitment } from '@/types/Commitment'
import {
   formatCurrency,
   currencyToNumber,
   numberToCurrency
} from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { useCommitment } from '@/hooks/useCommitment'

interface EditCommitmentModalProps {
   isOpen: boolean
   commitment: Commitment | null
   onClose: () => void
   onConfirm: (rowIndex: number) => void
}

export function EditCommitmentModal({
   isOpen,
   commitment,
   onClose,
   onConfirm
}: EditCommitmentModalProps) {
   const { month, year } = usePeriod()
   const { update, remove, isSaving, isDeleting } = useCommitment(month, String(year))

   const [amount, setAmount] = useState('')
   const [paymentDate, setPaymentDate] = useState('')

   useEffect(() => {
      if (commitment) {
         setAmount(numberToCurrency(commitment.amount))
         setPaymentDate(new Date().toISOString().slice(0, 10))
      }
   }, [commitment])

   const handleUpdate = async () => {
      if (!commitment) return

      await update({
         rowIndex: commitment.rowIndex,
         amount: currencyToNumber(amount),
         paymentDate,
         scope: 'single'
      })

      setAmount('')
      setPaymentDate('')

      onConfirm(commitment.rowIndex)
      onClose()
   }

   const handleDelete = async () => {
      if (!commitment) return

      await remove(commitment.rowIndex)

      onConfirm(commitment.rowIndex)
      onClose()
   }

   if (!commitment) return null

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={commitment.description}
         type="edit"
         isLoading={isSaving || isDeleting}
         loadingText={isDeleting ? 'Excluindo...' : 'Salvando...'}
         onSave={handleUpdate}
         onDelete={handleDelete}
      >
         <div className="space-y-4">
            {/* Info Summary - Visual mantido do 'atual' */}
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