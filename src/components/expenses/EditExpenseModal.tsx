import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateExpense, deleteExpense } from '@/api/endpoints/expenses'
import { usePeriod } from '@/contexts/PeriodContext'
import { numberToCurrency, currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import type { Expense } from '@/types/Expense'

interface EditExpenseModalProps {
   isOpen: boolean
   expense: Expense | null
   onClose: () => void
}

export function EditExpenseModal({ isOpen, expense, onClose }: EditExpenseModalProps) {
   const { month, year } = usePeriod()
   const queryClient = useQueryClient()

   const [amount, setAmount] = useState('')

   useEffect(() => {
      if (expense) {
         setAmount(numberToCurrency(expense.amount))
      }
   }, [expense])

   /* =========================
      MUTATIONS
      ========================= */
   const updateMutation = useMutation({
      mutationFn: () =>
         updateExpense(
            { rowIndex: expense!.rowIndex, amount: currencyToNumber(amount) }
         ),
      onSuccess: () => {
         queryClient.setQueryData<Expense[]>(
            ['expenses', month, year],
            old =>
               old?.map(e =>
                  e.rowIndex === expense!.rowIndex
                     ? { ...e, amount: currencyToNumber(amount) }
                     : e
               ) ?? []
         )
         onClose()
      }
   })

   const deleteMutation = useMutation({
      mutationFn: () =>
         deleteExpense(expense!.rowIndex, month, String(year)),
      onSuccess: () => {
         queryClient.setQueryData<Expense[]>(
            ['expenses', month, year],
            old => old?.filter(e => e.rowIndex !== expense!.rowIndex) ?? []
         )
         onClose()
      }
   })

   if (!expense) return null

   const isLoading = updateMutation.isPending || deleteMutation.isPending

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={expense.description}
         type="edit"
         isLoading={isLoading}
         onSave={() => updateMutation.mutate()}
         onDelete={() => deleteMutation.mutate()}
      >
         <div className="space-y-4">
            {/* Info Summary (Versão Anterior) */}
            <div className="bg-muted/30 p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
               Categoria: <span className="font-medium text-foreground">{expense.category}</span>
               <br />
               Data original: <span className="font-medium text-foreground">{expense.paymentDate}</span>
            </div>

            {/* Amount Input */}
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
         </div>
      </BaseModal>
   )
}