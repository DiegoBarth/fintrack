import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePeriod } from '@/contexts/PeriodContext'
import { useCommitment } from '@/hooks/useCommitment'
import { useValidation } from '@/hooks/useValidation'
import { CreateCommitmentSchema, CreateCardCommitmentSchema } from '@/schemas/commitment.schema'
import { CATEGORIES, COMMITMENT_TYPES, CARDS } from '@/config/constants'
import type { Commitment } from '@/types/Commitment'

interface AddCommitmentModalProps {
   isOpen: boolean
   onClose: () => void
}

type CommitmentType = 'Fixed' | 'Variable' | 'Credit_card' | ''

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
      if (type === 'Fixed' && dueDate) {
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
      if (type === 'Credit_card') {
         const data = validate(CreateCardCommitmentSchema, {
            description: values.description,
            category: values.category,
            type,
            card: values.card,
            amount: currencyToNumber(String(values.amount)),
            totalInstallments: Number(values.totalInstallments),
            dueDate: values.dueDate
         })

         if (!data) return

         await createCard(data as any)
      }
      else {
         const data = validate(CreateCommitmentSchema, {
            description: values.description,
            category: values.category,
            type,
            amount: currencyToNumber(String(values.amount)),
            dueDate: values.dueDate,
            months: type === 'Fixed' ? values.months : 1
         })

         if (!data) return

         await create(data as any)
      }

      reset(defaultValues)
      onClose()
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição *</label>
                  <input
                     className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                     placeholder="Ex: Aluguel, Parcela Notebook"
                     {...register('description')}
                  />
               </div>

               {/* Category & Type */}
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria *</label>
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
                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo *</label>
                     <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
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
            {(type === 'Fixed' || type === 'Variable') && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Valor *</label>
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
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Vencimento *</label>
                        <input
                           type="date"
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           {...register('dueDate')}
                        />
                     </div>
                  </div>

                  {type === 'Fixed' && (
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                           Repetir por (meses)
                        </label>
                        <input
                           type="number"
                           min={1}
                           max={12}
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           {...register('months', { valueAsNumber: true })}
                        />
                     </div>
                  )}
               </div>
            )}

            {/* Card Fields */}
            {type === 'Credit_card' && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Selecione o Cartão *</label>
                     <Controller
                        name="card"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              options={CARDS}
                           />
                        )}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Total *</label>
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
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Parcelas *</label>
                        <input
                           type="number"
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           {...register('totalInstallments')}
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Primeiro Vencimento *</label>
                     <input
                        type="date"
                        className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        {...register('dueDate')}
                     />
                  </div>
               </div>
            )}
         </div>
      </BaseModal>
   )
}