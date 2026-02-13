import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { usePeriod } from '@/contexts/PeriodContext'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { useIncome } from '@/hooks/useIncome'
import { useValidation } from '@/hooks/useValidation'
import { CreateIncomeSchema } from '@/schemas/income.schema'
import { DateField } from '@/components/ui/DateField'
import type { Income } from '@/types/Income'

interface AddIncomeModalProps {
   isOpen: boolean
   onClose: () => void
}

const defaultValues: Partial<Income> = {
   description: '',
   amount: '',
   expectedDate: '',
   receivedDate: ''
}

/**
 * Modal for creating a new income record.
 * Uses TanStack Query for state management and cache updates.
 */
export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
   const { month, year } = usePeriod()
   const { create, isSaving } = useIncome(month, String(year))
   const { validate } = useValidation()

   const { control, register, handleSubmit, reset } = useForm<Income>({
      defaultValues
   })

   useEffect(() => {
      if (!isOpen) {
         reset(defaultValues)
      }
   }, [isOpen, reset])

   const handleSave = async (values: Income) => {
      const data = validate(CreateIncomeSchema, {
         description: values.description,
         amount: currencyToNumber(String(values.amount)),
         expectedDate: values.expectedDate,
         receivedDate: !values.receivedDate ? undefined : values.receivedDate
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
         title="Nova receita"
         type="create"
         isLoading={isSaving}
         loadingText="Salvando..."
         onSave={handleSubmit(handleSave)}
      >
         <div className="space-y-4">
            {/* Description Field */}
            <div>
               <label htmlFor="income-description" className="block text-xs font-medium text-muted-foreground mb-1">
                  Descrição *
               </label>
               <input
                  id="income-description"
                  aria-required="true"
                  placeholder="Ex: Salário, Venda de Produto"
                  autoComplete="off"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                     dark:text-gray-100 rounded-md p-2"
                  {...register('description')}
               />
            </div>

            {/* Amount Field */}
            <div>
               <label htmlFor="income-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                  Valor *
               </label>
               <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                     <input
                        id="income-amount"
                        aria-required="true"
                        aria-label="Valor da receita em reais"
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                           dark:text-gray-100 rounded-md p-2"
                        autoComplete="off"
                        value={field.value}
                        onChange={e => field.onChange(formatCurrency(e.target.value))}
                     />
                  )}
               />
            </div>

            {/* Expected Date Field */}
            <div>
               <label htmlFor="income-expected-date" className="block text-xs font-medium text-muted-foreground mb-1">
                  Data Prevista *
               </label>
               <Controller
                  control={control}
                  name="expectedDate"
                  rules={{ required: true }}
                  render={({ field }) => (
                     <DateField
                        value={field.value}
                        onChange={field.onChange}
                     />
                  )}
               />
            </div>

            {/* Received Date Field */}
            <div>
               <label htmlFor="income-received-date" className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de Recebimento (opcional)
               </label>
               <Controller
                  control={control}
                  name="receivedDate"
                  render={({ field }) => (
                     <DateField
                        value={field.value}
                        onChange={field.onChange}
                     />
                  )}
               />
            </div>
         </div>
      </BaseModal>
   )
}