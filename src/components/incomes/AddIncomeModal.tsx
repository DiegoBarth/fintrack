import { useState, useEffect } from 'react'
import { usePeriod } from '@/contexts/PeriodContext'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { useIncome } from '@/hooks/useIncome'
import { useValidation } from '@/hooks/useValidation'
import { CreateIncomeSchema } from '@/schemas/income.schema'

interface AddIncomeModalProps {
   isOpen: boolean
   onClose: () => void
}

/**
 * Modal for creating a new income record.
 * Uses TanStack Query for state management and cache updates.
 */
export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
   const { month, year } = usePeriod()
   const { create, isSaving } = useIncome(month, String(year))
   const { validate } = useValidation()
   const [description, setDescription] = useState('')
   const [expectedDate, setExpectedDate] = useState('')
   const [receivedDate, setReceivedDate] = useState('')
   const [amount, setAmount] = useState('')

   useEffect(() => {
      if (!isOpen) {
         setDescription('')
         setExpectedDate('')
         setReceivedDate('')
         setAmount('')
      }
   }, [isOpen])

   const handleSave = async () => {
      const data = validate(CreateIncomeSchema, {
         description,
         amount: currencyToNumber(amount),
         expectedDate,
         receivedDate
      })

      if (!data) return

      await create(data as any)

      setDescription('')
      setAmount('')
      setExpectedDate('')
      setReceivedDate('')

      onClose()
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Nova receita"
         type="create"
         isLoading={isSaving}
         loadingText="Salvando..."
         onSave={() => handleSave()}
      >
         <div className="space-y-4">
            {/* Description Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Descrição *
               </label>
               <input
                  placeholder="Ex: Salário, Venda de Produto"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
               />
            </div>

            {/* Amount Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor *
               </label>
               <input
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
               />
            </div>

            {/* Expected Date Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data Prevista *
               </label>
               <input
                  type="date"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
               />
            </div>

            {/* Received Date Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de Recebimento (opcional)
               </label>
               <input
                  type="date"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={receivedDate}
                  onChange={e => setReceivedDate(e.target.value)}
               />
            </div>
         </div>
      </BaseModal>
   )
}