import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePeriod } from '@/contexts/PeriodContext'
import { useCommitment } from '@/hooks/useCommitment'
import { useValidation } from '@/hooks/useValidation'
import { CreateCommitmentSchema, CreateCardCommitmentSchema } from '@/schemas/commitment.schema'
import { CATEGORIES, COMMITMENT_TYPES, CARDS } from '@/config/constants'
import { useToast } from '@/contexts/toast';
import type { Commitment } from '@/types/Commitment'

import { DateField } from '@/components/ui/DateField'

interface AddCommitmentModalProps {
   isOpen: boolean
   onClose: () => void
}

type CommitmentType = 'Fixo' | 'Variável' | 'Cartão' | ''

const defaultValues: Partial<Commitment> = {
   description: '',
   category: '',
   type: '',
   dueDate: '',
   months: 1,
   card: '',
   amount: '',
   totalInstallments: 1
}

export function AddCommitmentModal({ isOpen, onClose }: AddCommitmentModalProps) {
   const { month, year } = usePeriod()
   const { create, createCard, isSaving } = useCommitment(month, String(year))
   const toast = useToast();
   const { validate } = useValidation()

   const { control, register, handleSubmit, watch, setValue, reset } = useForm<Commitment>({
      defaultValues
   })

   const type = watch('type')
   const dueDate = watch('dueDate')

   /* =========================
      REGRAS FIXO
      ========================= */
   useEffect(() => {
      if (type === 'Fixo' && dueDate) {
         const selectedDate = new Date(dueDate)
         setValue('months', 12 - selectedDate.getMonth())
      }
   }, [type, dueDate])

   /* =========================
      RESET ON CLOSE
      ========================= */
   useEffect(() => {
      if (!isOpen) {
         reset(defaultValues)
      }
   }, [isOpen, reset])

   async function handleSave(values: Commitment) {
      if (type === 'Cartão') {
         const data = validate(CreateCardCommitmentSchema, {
            description: values.description,
            category: values.category,
            type,
            card: values.card,
            amount: currencyToNumber(String(values.amount)),
            totalInstallments: Number(values.totalInstallments),
            dueDate: values.dueDate
         })

         if (!data) return;

         await createCard(data as any);
         toast.success('Compromisso de cartão criado com sucesso!');
      }
      else {
         const data = validate(CreateCommitmentSchema, {
            description: values.description,
            category: values.category,
            type,
            amount: currencyToNumber(String(values.amount)),
            dueDate: values.dueDate,
            months: type === 'Fixo' ? values.months : 1
         })

         if (!data) return;

         await create(data as any);
         toast.success('Compromisso criado com sucesso!');
      }

      reset(defaultValues);
      onClose();
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo compromisso"
         type="create"
         isLoading={isSaving}
         loadingText="Salvando..."
         onSave={handleSubmit(handleSave)}
      >
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
               {/* Description */}
               <div>
                  <label htmlFor="commitment-description" className="block text-xs font-medium text-muted-foreground mb-1">Descrição *</label>
                  <input
                     id="commitment-description"
                     aria-required="true"
                     autoComplete="off"
                     className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                        dark:text-gray-100 rounded-md p-2"
                     placeholder="Ex: Aluguel, Parcela Notebook"
                     {...register('description')}
                  />
               </div>

               {/* Category & Type */}
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label id="commitment-category-label" className="block text-xs font-medium text-muted-foreground mb-1">Categoria *</label>
                     <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
                              id="commitment-category"
                              label="Categoria"
                              value={field.value}
                              onChange={field.onChange}
                              options={CATEGORIES}
                           />
                        )}
                     />
                  </div>
                  <div>
                     <label id="commitment-type-label" className="block text-xs font-medium text-muted-foreground mb-1">Tipo *</label>
                     <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
                              id="commitment-type"
                              label="Tipo de compromisso"
                              value={field.value}
                              onChange={value => field.onChange(value as CommitmentType)}
                              options={COMMITMENT_TYPES}
                           />
                        )}
                     />
                  </div>
               </div>
            </div>

            <hr className="border-dashed" />

            {/* Fixed / Variable Fields */}
            {(type === 'Fixo' || type === 'Variável') && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label htmlFor="commitment-amount" className="block text-xs font-medium text-muted-foreground mb-1">Valor *</label>
                        <Controller
                           name="amount"
                           control={control}
                           render={({ field }) => (
                              <input
                                 {...field}
                                 id="commitment-amount"
                                 aria-required="true"
                                 autoComplete="off"
                                 className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                                    dark:text-gray-100 rounded-md p-2"
                                 value={field.value}
                                 onChange={e => field.onChange(formatCurrency(e.target.value))}
                              />
                           )}
                        />
                     </div>

                     {type === 'Fixo' && (
                        <div>
                           <label htmlFor="commitment-months" className="block text-xs font-medium text-muted-foreground mb-1">
                              Repetir por (meses)
                           </label>
                           <input
                              id="commitment-months"
                              aria-label="Número de meses para repetir o compromisso"
                              autoComplete="off"
                              type="number"
                              min={1}
                              max={12}
                              pattern="[0-9]*"
                              inputMode="numeric"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                              dark:text-gray-100 rounded-md p-2"
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
                     )}


                  </div>
                  <div>
                     <label htmlFor="commitment-due-date" className="block text-xs font-medium text-muted-foreground mb-1">Vencimento *</label>
                     <Controller
                        control={control}
                        name="dueDate"
                        render={({ field }) => (
                           <DateField
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={date => field.onChange(date)}
                           />
                        )}
                     />
                  </div>

               </div>
            )}

            {/* Card Fields */}
            {type === 'Cartão' && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                     <label id="commitment-card-label" className="block text-xs font-medium text-muted-foreground mb-1">Selecione o Cartão *</label>
                     <Controller
                        name="card"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
                              id="commitment-card"
                              label="Cartão de crédito"
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              options={CARDS}
                           />
                        )}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label htmlFor="commitment-total-amount" className="block text-xs font-medium text-muted-foreground mb-1">Valor Total *</label>
                        <Controller
                           name="amount"
                           control={control}
                           render={({ field }) => (
                              <input
                                 id="commitment-total-amount"
                                 aria-required="true"
                                 autoComplete="off"
                                 className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                                    dark:text-gray-100 rounded-md p-2"
                                 value={field.value}
                                 onChange={e => field.onChange(formatCurrency(e.target.value))}
                              />
                           )}
                        />
                     </div>
                     <div>
                        <label htmlFor="commitment-total-installments" className="block text-xs font-medium text-muted-foreground mb-1">Parcelas *</label>
                        <input
                           id="compromisso-total-parcelas"
                           min={1}
                           max={60}
                           aria-required="true"
                           autoComplete="off"
                           aria-label="Total de parcelas do compromisso"
                           type="number"
                           className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                              dark:text-gray-100 rounded-md p-2"
                           {...register('totalInstallments')}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Primeiro Vencimento *
                     </label>

                     <Controller
                        control={control}
                        name="dueDate"
                        render={({ field }) => (
                           <DateField
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={date => field.onChange(date)}
                           />
                        )}
                     />
                  </div>
               </div>
            )}
         </div>
      </BaseModal>
   )
}