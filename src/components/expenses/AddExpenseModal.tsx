import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePeriod } from '@/contexts/PeriodContext'
import { useExpense } from '@/hooks/useExpense'
import { useValidation } from '@/hooks/useValidation'
import { CreateExpenseSchema } from '@/schemas/expense.schema'
import { CATEGORIES } from '@/config/constants'
import type { Expense } from '@/types/Expense'

interface AddExpenseModalProps {
   isOpen: boolean
   onClose: () => void
}

const defaultValues: Partial<Expense> = {
   description: '',
   category: '',
   paymentDate: '',
   amount: ''
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
   const { month, year } = usePeriod()
   const { create, isSaving } = useExpense(month, String(year))
   const { validate } = useValidation()

   const { control, register, handleSubmit, reset } = useForm<Expense>({
      defaultValues
   })

   useEffect(() => {
      if (!isOpen) {
         reset(defaultValues)
      }
   }, [isOpen, reset])


   const handleSave = async (values: Expense) => {
      const data = validate(CreateExpenseSchema, {
         description: values.description,
         category: values.category,
         amount: currencyToNumber(String(values.amount)),
         paymentDate: values.paymentDate
      })

      if (!data) return

      await create(data as any)

      reset(defaultValues)
      onClose()
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo Gasto"
         type="create"
         isLoading={isSaving}
         onSave={handleSubmit(handleSave)}
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
                  {...register('description')}
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
                  {...register('paymentDate')}
               />
            </div>

            {/* Category */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Categoria *
               </label>
               <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                     <CustomSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={CATEGORIES}
                     />
                  )}
               />
            </div>

            {/* Amount */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor *
               </label>
               <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                     <input
                        className="mt-1 w-full rounded-md border p-2"
                        value={field.value}
                        onChange={e => field.onChange(formatCurrency(e.target.value))}
                     />
                  )}
               />
            </div>
         </div>
      </BaseModal>
   )
}