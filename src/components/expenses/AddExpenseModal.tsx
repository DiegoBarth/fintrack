import { useEffect, useState } from 'react'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePeriod } from '@/contexts/PeriodContext'
import { useExpense } from '@/hooks/useExpense'
import { useValidation } from '@/hooks/useValidation'
import { CreateExpenseSchema } from '@/schemas/expense.schema'
import { CATEGORIES } from '@/config/constants'

interface AddExpenseModalProps {
   isOpen: boolean
   onClose: () => void
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
   const { month, year } = usePeriod()
   const { create, isSaving } = useExpense(month, String(year))
   const { validate } = useValidation()

   const [description, setDescription] = useState('')
   const [paymentDate, setPaymentDate] = useState('')
   const [amount, setAmount] = useState('')
   const [category, setCategory] = useState('')

   useEffect(() => {
      if (!isOpen) {
         setDescription('')
         setPaymentDate('')
         setCategory('')
         setAmount('')
      }
   }, [isOpen])


   const handleSave = async () => {
      const data = validate(CreateExpenseSchema, {
         description,
         category,
         amount: currencyToNumber(amount),
         paymentDate
      })

      if (!data) return

      await create(data as any)

      setDescription('')
      setPaymentDate('')
      setCategory('')
      setAmount('')

      onClose()
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo Gasto"
         type="create"
         isLoading={isSaving}
         onSave={() => handleSave()}
      >
         <div className="space-y-4">
            {/* Description */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Descrição *
               </label>
               <input
                  placeholder="Ex: Aluguel, Supermercado"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
               />
            </div>

            {/* Date */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de pagamento *
               </label>
               <input
                  type="date"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
               />
            </div>

            {/* Category */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Categoria *
               </label>
               <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={CATEGORIES}
                  placeholder="Selecione uma categoria"
               />
            </div>

            {/* Amount */}
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
         </div>
      </BaseModal>
   )
}