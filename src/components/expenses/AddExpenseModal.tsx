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
import { DateField } from '@/components/ui/DateField'
import { useToast } from '@/contexts/toast';
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

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
   const { month, year } = usePeriod()
   const { create, isSaving } = useExpense(month, String(year))
   const toast = useToast();
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
      });

      if (!data) return;

      await create(data as any);
      toast.success('Gasto criado com sucesso!');
      reset(defaultValues);
      onClose();
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
               <label htmlFor="expense-description" className="block text-xs font-medium text-muted-foreground mb-1">
                  Descrição *
               </label>
               <input
                  id="expense-description"
                  aria-required="true"
                  placeholder="Ex: Aluguel, Supermercado"
                  autoComplete="off"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                     dark:text-gray-100 rounded-md p-2"
                  {...register('description')}
               />
            </div>

            {/* Amount */}
            <div>
               <label htmlFor="expense-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor *
               </label>
               <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                     <input
                        id="expense-amount"
                        aria-required="true"
                        aria-label="Valor do gasto em reais"
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                           dark:text-gray-100 rounded-md p-2"
                        autoComplete="off"
                        value={field.value}
                        onChange={e => field.onChange(formatCurrency(e.target.value))}
                     />
                  )}
               />
            </div>

            {/* Category */}
            <div>
               <label id="expense-category-label" className="block text-xs font-medium text-muted-foreground mb-1">
                  Categoria *
               </label>
               <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                     <CustomSelect
                        id="expense-category"
                        label="Categoria do gasto"
                        value={field.value}
                        onChange={field.onChange}
                        options={CATEGORIES}
                     />
                  )}
               />
            </div>

            {/* Date */}
            <div>
               <label htmlFor="expense-payment-date" className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de pagamento *
               </label>
               <Controller
                  control={control}
                  name="paymentDate"
                  render={({ field }) => (
                     <DateField
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={date => field.onChange(date)}
                     />
                  )}
               />
            </div>
         </div>
      </BaseModal>
   )
}