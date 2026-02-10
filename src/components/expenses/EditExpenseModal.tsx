import { useEffect, useState } from 'react'
import { usePeriod } from '@/contexts/PeriodContext'
import { numberToCurrency, currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import type { Expense } from '@/types/Expense'
import { useExpenses } from '@/hooks/useExpense'

interface EditExpenseModalProps {
   isOpen: boolean
   expense: Expense | null
   onClose: () => void
}

export function EditExpenseModal({ isOpen, expense, onClose }: EditExpenseModalProps) {
   const { month, year } = usePeriod()
   const { update, remove, isSaving, isDeleting } = useExpenses(month, String(year))

   const [amount, setAmount] = useState('')

   useEffect(() => {
      if (expense) {
         setAmount(numberToCurrency(expense.amount))
      }
   }, [expense])

   const handleUpdate = async () => {
      await update({
         rowIndex: expense!.rowIndex,
         amount: currencyToNumber(amount)
      })
      setAmount('')
      onClose()
   }

   const handleDelete = async () => {
      await remove(expense!.rowIndex)
      setAmount('')

      onClose()
   }

   if (!expense) return null

   const isLoading = isSaving || isDeleting

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={expense.description}
         type="edit"
         isLoading={isLoading}
         loadingText={(isSaving ? 'Salvando...' : 'Excluindo...')}
         onSave={() => handleUpdate()}
         onDelete={() => handleDelete()}
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