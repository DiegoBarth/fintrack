import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateIncome, deleteIncome } from '@/api/endpoints/incomes'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Income } from '@/types/Income'
import {
   numberToCurrency,
   currencyToNumber,
   dateBRToISO,
   formatCurrency,
   formatDateBR
} from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'

interface EditIncomeModalProps {
   isOpen: boolean
   income: Income | null
   onClose: () => void
}

export function EditIncomeModal({ isOpen, income, onClose }: EditIncomeModalProps) {
   const { month, year } = usePeriod()
   const queryClient = useQueryClient()

   const [amount, setAmount] = useState('')
   const [receivedDate, setReceivedDate] = useState('')

   useEffect(() => {
      if (income) {
         setAmount(numberToCurrency(income.amount))
         setReceivedDate(
            income.receivedDate
               ? dateBRToISO(income.receivedDate)
               : new Date().toISOString().slice(0, 10)
         )
      }
   }, [income])

   /* =========================
      MUTATIONS
      ========================= */
   const updateMutation = useMutation({
      mutationFn: () =>
         updateIncome(
            {
               rowIndex: income!.rowIndex,
               amount: currencyToNumber(amount),
               receivedDate
            }
         ),
      onSuccess: () => {
         queryClient.setQueryData<Income[]>(
            ['incomes', month, year],
            old =>
               old?.map(r =>
                  r.rowIndex === income!.rowIndex
                     ? {
                        ...r,
                        amount: currencyToNumber(amount),
                        receivedDate: formatDateBR(String(receivedDate))
                     }
                     : r
               ) ?? []
         )
         onClose()
      }
   })

   const deleteMutation = useMutation({
      mutationFn: () =>
         deleteIncome(income!.rowIndex, month, String(year)),
      onSuccess: () => {
         queryClient.setQueryData<Income[]>(
            ['incomes', month, year],
            old => old?.filter(r => r.rowIndex !== income!.rowIndex) ?? []
         )
         onClose()
      }
   })

   if (!income) return null

   const isLoading = updateMutation.isPending || deleteMutation.isPending

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={income.description}
         type="edit"
         isLoading={isLoading}
         onSave={() => updateMutation.mutate()}
         onDelete={() => deleteMutation.mutate()}
      >
         <div className="space-y-4">
            {/* Amount Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor
               </label>
               <input
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
               />
            </div>

            {/* Received Date Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de recebimento
               </label>
               <input
                  type="date"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={receivedDate}
                  onChange={e => setReceivedDate(e.target.value)}
               />
            </div>
         </div>
      </BaseModal>
   )
}