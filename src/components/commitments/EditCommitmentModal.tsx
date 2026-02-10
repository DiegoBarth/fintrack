import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCommitment, deleteCommitment } from '@/api/endpoints/commitments'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Commitment } from '@/types/Commitment'
import { numberToCurrency, currencyToNumber, formatCurrency, formatDateBR } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'

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
   const queryClient = useQueryClient()

   const [amount, setAmount] = useState('')
   const [paymentDate, setPaymentDate] = useState('')

   useEffect(() => {
      if (commitment) {
         setAmount(numberToCurrency(commitment.amount))
         setPaymentDate(new Date().toISOString().slice(0, 10))
      }
   }, [commitment])

   const updateMutation = useMutation({
      mutationFn: () =>
         updateCommitment(
            {
               rowIndex: commitment!.rowIndex,
               amount: currencyToNumber(amount),
               paymentDate
            }
         ),
      onSuccess: () => {
         queryClient.setQueryData<Commitment[]>(
            ['commitments', month, year],
            old =>
               old?.map(c =>
                  c.rowIndex === commitment!.rowIndex
                     ? {
                        ...c,
                        valor: currencyToNumber(amount),
                        paymentDate
                     }
                     : c
               ) ?? []
         )

         queryClient.setQueryData<Commitment[]>(
            ['commitments', 'alerts', year],
            old =>
               old?.map(c =>
                  c.rowIndex === commitment!.rowIndex
                     ? { ...c, dataPagamento: formatDateBR(paymentDate) }
                     : c
               ) ?? []
         );

         if (commitment) {
            onConfirm(commitment.rowIndex)
         }
         onClose()
      }
   })

   const deleteMutation = useMutation({
      mutationFn: () =>
         deleteCommitment(commitment!.rowIndex, month, String(year)),
      onSuccess: () => {
         queryClient.setQueryData<Commitment[]>(
            ['commitments', month, year],
            old => old?.filter(c => c.rowIndex !== commitment!.rowIndex) ?? []
         )

         queryClient.setQueryData<Commitment[]>(
            ['commitments', 'alerts', year],
            old =>
               old?.filter(c => c.rowIndex !== commitment!.rowIndex) ?? []
         )

         if (commitment) {
            onConfirm(commitment.rowIndex)
         }
         onClose()
      }
   })

   if (!commitment) return null

   const isPending = updateMutation.isPending || deleteMutation.isPending
   const activeAction = deleteMutation.isPending ? 'deleting' : 'saving'

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={commitment.description}
         type="edit"
         isLoading={isPending}
         loadingText={activeAction === 'deleting' ? 'Excluindo...' : 'Salvando...'}
         onSave={() => updateMutation.mutate()}
         onDelete={() => deleteMutation.mutate()}
      >
         <div className="space-y-4">
            {/* Info Summary - Mantido da versão atual */}
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