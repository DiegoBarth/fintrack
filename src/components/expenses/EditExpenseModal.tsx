import { useEffect, useState } from 'react'
import { updateExpense, deleteExpense } from '@/api/expenses'
import { usePeriod } from '@/contexts/PeriodContext'
import { numberToCurrency, currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '../ui/ModalBase'
import type { Expense } from '@/types/Expense'

interface EditExpenseModalProps {
   isOpen: boolean
   expense: Expense | null
   onClose: () => void
   onConfirm: () => void
}

/**
 * Modal for editing or deleting an existing expense.
 * Displays the description as the title and focuses on amount adjustment.
 */
export function EditExpenseModal({ isOpen, expense, onClose, onConfirm }: EditExpenseModalProps) {
   const { month, year } = usePeriod()

   const [amount, setAmount] = useState('')
   const [isLoading, setIsLoading] = useState(false)
   const [activeAction, setActiveAction] = useState<'saving' | 'deleting' | null>(null)

   /**
    * Updates internal state when the selected expense changes.
    */
   useEffect(() => {
      if (expense) {
         setAmount(numberToCurrency(expense.amount))
      }
   }, [expense])

   if (!expense) return null

   /**
    * Handles the update logic.
    */
   async function handleSave() {
      if (!expense) return;

      setIsLoading(true)
      setActiveAction('saving')
      try {
         await updateExpense(
            {
               rowIndex: expense.rowIndex,
               amount: currencyToNumber(amount)
            },
            month,
            String(year)
         )
         onConfirm()
         onClose()
      } catch (error) {
         console.error("Failed to update expense:", error)
      } finally {
         setIsLoading(false)
         setActiveAction(null)
      }
   }

   /**
    * Handles the deletion logic.
    */
   async function handleDelete() {
      if (!expense) return

      setIsLoading(true)
      setActiveAction('deleting')
      try {
         await deleteExpense(expense.rowIndex, month, String(year))
         onConfirm()
         onClose()
      } catch (error) {
         console.error("Failed to delete expense:", error)
      } finally {
         setIsLoading(false)
         setActiveAction(null)
      }
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={expense.description}
         type="edit"
         isLoading={isLoading}
         loadingText={activeAction === 'deleting' ? 'Excluindo...' : 'Salvando...'}
         onSave={handleSave}
         onDelete={handleDelete}
      >
         <div className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
               Categoria: <span className="font-medium text-foreground">{expense.category}</span>
               <br />
               Data original: <span className="font-medium text-foreground">{expense.paymentDate}</span>
            </div>

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