import { useEffect, useState } from 'react'
import { usePeriod } from '@/contexts/PeriodContext'
import { useIncome } from '@/hooks/useIncome'
import type { Income } from '@/types/Income'
import {
   numberToCurrency,
   currencyToNumber,
   dateBRToISO,
   formatCurrency
} from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'

interface EditIncomeModalProps {
   isOpen: boolean
   income: Income | null
   onClose: () => void
}

export function EditIncomeModal({ isOpen, income, onClose }: EditIncomeModalProps) {
   const { month, year } = usePeriod()
   const { update, remove, isSaving, isDeleting } = useIncome(month, String(year))

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


   const handleUpdate = async () => {
      await update({
         rowIndex: income!.rowIndex,
         amount: currencyToNumber(amount),
         receivedDate
      })
      setAmount('')
      setReceivedDate('')
      onClose()
   }

   const handleDelete = async () => {
      await remove(income!.rowIndex)

      onClose()
   }

   if (!income) return null

   const isLoading = isSaving || isDeleting

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title={income.description}
         type="edit"
         isLoading={isLoading}
         loadingText={(isSaving ? 'Salvando...' : 'Excluindo...')}
         onSave={() => handleUpdate()}
         onDelete={() => handleDelete()}
      >
         <div className="space-y-4">
            {/* Amount Field */}
            <div>
               <label htmlFor="edit-income-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor
               </label>
               <input
                  id="edit-income-amount"
                  aria-label="Valor da receita em reais"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
               />
            </div>

            {/* Received Date Field */}
            <div>
               <label htmlFor="edit-income-received-date" className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de recebimento
               </label>
               <input
                  id="edit-income-received-date"
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