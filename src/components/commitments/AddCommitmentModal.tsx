import { useEffect, useState } from 'react'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePeriod } from '@/contexts/PeriodContext'
import { useCommitment } from '@/hooks/useCommitment'
import { useValidation } from '@/hooks/useValidation'
import { CreateCommitmentSchema, CreateCardCommitmentSchema } from '@/schemas/commitment.schema'
import { CATEGORIES, COMMITMENT_TYPES, CARDS } from '@/config/constants'

interface AddCommitmentModalProps {
   isOpen: boolean
   onClose: () => void
}

type CommitmentType = 'Fixed' | 'Variable' | 'Credit_card' | ''

export function AddCommitmentModal({ isOpen, onClose }: AddCommitmentModalProps) {
   const { month, year } = usePeriod()
   const { create, createCard, isSaving } = useCommitment(month, String(year))
   const { validate } = useValidation()

   const [description, setDescription] = useState('')
   const [category, setCategory] = useState('')
   const [type, setType] = useState<CommitmentType>('')

   const [amount, setAmount] = useState('')
   const [dueDate, setDueDate] = useState('')
   const [monthsToRepeat, setMonthsToRepeat] = useState(1)

   const [cardName, setCardName] = useState('')
   const [totalAmount, setTotalAmount] = useState('')
   const [installments, setInstallments] = useState<number | ''>('')
   const [cardDueDate, setCardDueDate] = useState('')

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
      if (type === 'Credit_card') {
         const data = validate(CreateCardCommitmentSchema, {
            description,
            category,
            type,
            card: cardName,
            amount: currencyToNumber(amount),
            totalInstallments: Number(installments),
            dueDate: cardDueDate
         })
         if (!data) return

         await createCard(data as any)
      } else {
         const data = validate(CreateCommitmentSchema, {
            description,
            category,
            type,
            amount: currencyToNumber(amount),
            dueDate,
            months: type === 'Fixed' ? monthsToRepeat : 1
         })

         if (!data) return

         await create(data as any)
      }
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo compromisso"
         type="create"
         isLoading={isSaving}
         loadingText="Salvando..."
         onSave={() => handleSave()}
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