import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { usePeriod } from '@/contexts/PeriodContext'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { useIncome } from '@/hooks/useIncome'
import { useValidation } from '@/hooks/useValidation'
import { CreateIncomeSchema } from '@/schemas/income.schema'
import { DateField } from '@/components/ui/DateField'
import { MonthField } from '@/components/ui/MonthField'
import { useToast } from '@/contexts/toast';
import type { Income } from '@/types/Income'

interface AddIncomeModalProps {
   isOpen: boolean
   onClose: () => void
}

const defaultValues: Partial<Income & { months?: number }> = {
   description: '',
   amount: '',
   expectedDate: '',
   receivedDate: '',
   referenceMonth: '',
   months: 1
}

/**
 * Modal for creating a new income record.
 * Uses TanStack Query for state management and cache updates.
 */
export default function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
   const { month, year } = usePeriod()
   const { create, isSaving } = useIncome(month, String(year))
   const toast = useToast();
   const { validate } = useValidation()

   const { control, register, handleSubmit, reset, watch, setValue } = useForm<Income & { months?: number }>({
      defaultValues
   })

   useEffect(() => {
      if (!isOpen) {
         reset(defaultValues)
      }
   }, [isOpen, reset])

   useEffect(() => {
      if (!isOpen) return;

      const now = new Date();

      const resolvedMonth =
         month === 'all'
            ? now.getMonth() + 1
            : Number(month);

      const resolvedYear =
         month === 'all'
            ? now.getFullYear()
            : year;

      setValue(
         'referenceMonth',
         `${resolvedYear}-${String(resolvedMonth).padStart(2, '0')}`
      );
   }, [isOpen, month, year, setValue]);

   const handleSave = async (values: Income & { months?: number }) => {
      const data = validate(CreateIncomeSchema, {
         description: values.description,
         amount: currencyToNumber(String(values.amount)),
         expectedDate: values.expectedDate,
         receivedDate: !values.receivedDate ? undefined : values.receivedDate,
         referenceMonth: values.referenceMonth,
         months: values.months
      });

      if (!data) return;

      await create(data as any);
      toast.success('Receita criada com sucesso!');
      reset(defaultValues);
      onClose();
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

            {/* Amount + Repeat Fields */}
            <div className="flex gap-2">
               <div className="flex-1">
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
               <div className="w-30">
                  <label htmlFor="income-months" className="block text-xs font-medium text-muted-foreground mb-1">
                     Repetir por (meses)
                  </label>
                  <input
                     id="income-months"
                     type="number"
                     min={1}
                     max={12}
                     pattern="[0-9]*"
                     inputMode="numeric"
                     className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2"
                     {...register('months', {
                        valueAsNumber: true,
                        validate: value => value !== undefined && Number.isInteger(value) && value > 0 && value <= 12
                     })}
                     onInput={e => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value.replace(/[^\d]/g, '');
                        if (input.value && Number(input.value) < 1) input.value = '1';
                        if (input.value && Number(input.value) > 12) input.value = '12';
                     }}
                  />
               </div>
            </div>

            {/* Reference Month Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Mês de Referência *
               </label>
               <Controller
                  control={control}
                  name="referenceMonth"
                  render={({ field }) => (
                     <MonthField
                        value={field.value}
                        onChange={field.onChange}
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
                  render={({ field }) => (
                     <DateField
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={date => field.onChange(date)}
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