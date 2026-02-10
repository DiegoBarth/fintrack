import { useEffect, useState } from 'react'
import { createCommitment, createCard } from '@/api/endpoints/commitments'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/SelectCustomizado'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usePeriod } from '@/contexts/PeriodContext'
import type { Commitment } from '@/types/Commitment'

interface AddCommitmentModalProps {
   isOpen: boolean
   onClose: () => void
}

type CommitmentType = 'Fixed' | 'Variable' | 'Credit_card' | ''

const COMMITMENT_TYPES = [
   { label: 'Fixo', value: 'Fixed' },
   { label: 'Variável', value: 'Variable' },
   { label: 'Cartão de Crédito', value: 'Credit_card' },
]

const CATEGORIES = [
   'Alimentação', 'Banco', 'Beleza', 'Casa', 'Educação',
   'Empréstimos', 'Investimento', 'Lazer', 'Pets', 'Presentes',
   'Roupas', 'Saúde', 'Serviços', 'Streaming', 'Telefonia',
   'Transporte', 'Viagem'
]

const CARDS = ['Bradesco', 'Itaú', 'Mercado Pago']

export function AddCommitmentModal({ isOpen, onClose }: AddCommitmentModalProps) {
   const { month, year } = usePeriod()
   const queryClient = useQueryClient()

   const [description, setDescription] = useState('')
   const [category, setCategory] = useState('')
   const [type, setType] = useState<CommitmentType>('')

   // Fixed/Variable Fields
   const [amount, setAmount] = useState('')
   const [dueDate, setDueDate] = useState('')
   const [monthsToRepeat, setMonthsToRepeat] = useState(1)

   // Card Fields
   const [cardName, setCardName] = useState('')
   const [totalAmount, setTotalAmount] = useState('')
   const [installments, setInstallments] = useState<number | ''>('')
   const [cardDueDate, setCardDueDate] = useState('')

   /* =========================
      MUTATIONS
      ========================= */
   const commitmentMutation = useMutation({
      mutationFn: createCommitment,
      onSuccess: (newRecord: Commitment) => {
         queryClient.setQueryData<Commitment[]>(
            ['commitments', month, year],
            old => old ? [...old, newRecord] : [newRecord]
         )
         onClose()
      }
   })

   const cardMutation = useMutation({
      mutationFn: createCard,
      onSuccess: (newRecord: Commitment) => {
         queryClient.setQueryData<Commitment[]>(
            ['cards', month, year],
            old => old ? [...old, newRecord] : [newRecord]
         )
         onClose()
      }
   })

   /* =========================
      REGRAS FIXO
      ========================= */
   useEffect(() => {
      if (type === 'Fixed' && dueDate) {
         const selectedDate = new Date(dueDate)
         setMonthsToRepeat(12 - selectedDate.getMonth())
      }
   }, [type, dueDate])

   /* =========================
      RESET ON CLOSE
      ========================= */
   useEffect(() => {
      if (!isOpen) {
         setDescription(''); setCategory(''); setType('')
         setAmount(''); setDueDate(''); setMonthsToRepeat(1)
         setCardName(''); setTotalAmount(''); setInstallments('')
         setCardDueDate('')
      }
   }, [isOpen])

   async function handleSave() {
      if (!description || !category || !type) {
         alert('Preencha os campos obrigatórios')
         return
      }

      if (type === 'Credit_card') {
         if (!cardName || !totalAmount || !installments || !cardDueDate) {
            alert('Preencha os campos do cartão')
            return
         }

         cardMutation.mutate({
            type: 'Cartão',
            description,
            category,
            card: cardName,
            totalAmount: currencyToNumber(totalAmount),
            installments: Number(installments),
            dueDate: cardDueDate
         })
      } else {
         if (!amount || !dueDate) {
            alert('Preencha valor e data de vencimento')
            return
         }

         commitmentMutation.mutate({
            type: type as 'Fixed' | 'Variable',
            description,
            category,
            amount: currencyToNumber(amount),
            dueDate,
            months: type === 'Fixed' ? monthsToRepeat : 1
         })
      }
   }

   const isLoading = commitmentMutation.isPending || cardMutation.isPending

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo compromisso"
         type="create"
         onSave={handleSave}
         isLoading={isLoading}
      >
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
               {/* Description */}
               <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição *</label>
                  <input
                     className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                     placeholder="Ex: Aluguel, Parcela Notebook"
                     value={description}
                     onChange={e => setDescription(e.target.value)}
                  />
               </div>

               {/* Category & Type */}
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria *</label>
                     <CustomSelect
                        value={category}
                        onChange={setCategory}
                        options={CATEGORIES}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo *</label>
                     <CustomSelect
                        value={COMMITMENT_TYPES.find(t => t.value === type)?.label || ''}
                        onChange={(label) => {
                           const found = COMMITMENT_TYPES.find(t => t.label === label)
                           setType((found?.value as CommitmentType) || '')
                        }}
                        options={COMMITMENT_TYPES.map(t => t.label)}
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
                        <input
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           value={amount}
                           onChange={e => setAmount(formatCurrency(e.target.value))}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Vencimento *</label>
                        <input
                           type="date"
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           value={dueDate}
                           onChange={e => setDueDate(e.target.value)}
                        />
                     </div>
                  </div>

                  {type === 'Fixed' && (
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                           Repetir até o fim do ano ({monthsToRepeat} meses)
                        </label>
                        <input
                           type="number"
                           min={1}
                           max={12}
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           value={monthsToRepeat}
                           onChange={e => setMonthsToRepeat(Number(e.target.value))}
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
                     <CustomSelect
                        value={cardName}
                        onChange={setCardName}
                        options={CARDS}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Total *</label>
                        <input
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           value={totalAmount}
                           onChange={e => setTotalAmount(formatCurrency(e.target.value))}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Parcelas *</label>
                        <input
                           type="number"
                           className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                           value={installments}
                           onChange={e => setInstallments(Number(e.target.value))}
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-muted-foreground mb-1">Primeiro Vencimento *</label>
                     <input
                        type="date"
                        className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        value={cardDueDate}
                        onChange={e => setCardDueDate(e.target.value)}
                     />
                  </div>
               </div>
            )}
         </div>
      </BaseModal>
   )
}