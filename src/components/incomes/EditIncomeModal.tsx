import { useEffect, useState } from 'react'
import { updateIncome, deleteIncome } from '@/api/endpoints/incomes'
import { usePeriod } from '@/contexts/PeriodContext'
import { numberToCurrency, currencyToNumber, dateBRToISO, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import type { Income } from '@/types/Income'

interface EditIncomeModalProps {
   isOpen: boolean
   income: Income | null
   onClose: () => void
   onConfirm: () => void
}

/**
 * Modal for editing or deleting an existing income entry.
 * Integrates with BaseModal to maintain UI consistency.
 */
export function EditIncomeModal({ isOpen, income, onClose, onConfirm }: EditIncomeModalProps) {
   const { month, year } = usePeriod()

   const [amount, setAmount] = useState('')
   const [receivedDate, setReceivedDate] = useState('')
   const [isLoading, setIsLoading] = useState(false)
   const [activeAction, setActiveAction] = useState<'saving' | 'deleting' | null>(null)

   /**
    * Synchronizes internal state whenever the income prop changes.
    */
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

   if (!income) return null

   const handleSave = async () => {
      if (!income) return;

      setIsLoading(true)
      setActiveAction('saving')
      try {
         await updateIncome(
            {
               rowIndex: income.rowIndex,
               amount: currencyToNumber(amount),
               receivedDate
            },
            month,
            String(year)
         )
         onConfirm()
         onClose()
      } catch (error) {
         console.error("Failed to update income:", error)
      } finally {
         setIsLoading(false)
         setActiveAction(null)
      }
   }

   const handleDelete = async () => {
      if (!income) return

      setIsLoading(true)
      setActiveAction('deleting')
      try {
         await deleteIncome(income.rowIndex, month, String(year))
         onConfirm()
         onClose()
      } catch (error) {
         console.error("Failed to delete income:", error)
      } finally {
         setIsLoading(false)
         setActiveAction(null)
      }
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={income.description}
         type="edit"
         isLoading={isLoading}
         loadingText={activeAction === 'deleting' ? 'Excluindo...' : 'Salvando...'}
         onSave={handleSave}
         onDelete={handleDelete}
      >
         <div className="space-y-4">
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor
               </label>
               <input
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-primary outline-none"
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
               />
            </div>

            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de recebimento
               </label>
               <input
                  type="date"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-primary outline-none"
                  value={receivedDate}
                  onChange={e => setReceivedDate(e.target.value)}
               />
            </div>
         </div>
      </BaseModal>
   )
}