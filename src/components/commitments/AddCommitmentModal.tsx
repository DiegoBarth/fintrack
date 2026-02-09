import { useEffect, useState } from 'react'
import { createCommitment, createCard } from '@/api/commitments'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '../ui/ModalBase'
import { CustomSelect } from '../ui/SelectCustomizado'

interface AddCommitmentModalProps {
   isOpen: boolean
   onClose: () => void
   onSave: () => void
}

// Definição estrita dos tipos para evitar erros de compilação
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

export function AddCommitmentModal({ isOpen, onClose, onSave }: AddCommitmentModalProps) {
   const [description, setDescription] = useState('')
   const [category, setCategory] = useState('')
   const [type, setType] = useState<CommitmentType>('') // Estado agora usa o tipo estrito

   // Fixed/Variable Fields
   const [amount, setAmount] = useState('')
   const [dueDate, setDueDate] = useState('')
   const [monthsToRepeat, setMonthsToRepeat] = useState(1)

   // Card Fields
   const [cardName, setCardName] = useState('')
   const [totalAmount, setTotalAmount] = useState('')
   const [installments, setInstallments] = useState<number | ''>('')
   const [cardDueDate, setCardDueDate] = useState('')

   const [isLoading, setIsLoading] = useState(false)

   /**
    * Auto-calculate remaining months in the year for 'Fixed' expenses.
    */
   useEffect(() => {
      if (type === 'Fixed' && dueDate) {
         const selectedDate = new Date(dueDate)
         setMonthsToRepeat(12 - selectedDate.getMonth())
      }
   }, [type, dueDate])

   /**
    * Reset form state when modal closes.
    */
   useEffect(() => {
      if (!isOpen) {
         setDescription(''); setCategory(''); setType('')
         setAmount(''); setDueDate(''); setMonthsToRepeat(1)
         setCardName(''); setTotalAmount(''); setInstallments('')
         setCardDueDate(''); setIsLoading(false)
      }
   }, [isOpen])

   async function handleSave() {
      if (!description || !category || !type) {
         alert('Preencha os campos obrigatórios (Descrição, Categoria e Tipo)')
         return
      }

      setIsLoading(true)
      try {
         if (type === 'Credit_card') {
            if (!cardName || !totalAmount || !installments || !cardDueDate) {
               alert('Preencha todos os campos do cartão')
               setIsLoading(false)
               return
            }

            await createCard({
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
               alert('Preencha o valor e a data de vencimento')
               setIsLoading(false)
               return
            }

            await createCommitment({
               // Aqui fazemos o cast seguro pois já validamos no if acima
               type: type as 'Fixed' | 'Variable',
               description,
               category,
               amount: currencyToNumber(amount),
               dueDate,
               months: type === 'Fixed' ? monthsToRepeat : 1
            })
         }

         onSave()
         onClose()
      } catch (error) {
         console.error("Failed to create commitment:", error)
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo Compromisso"
         type="create"
         onSave={handleSave}
         isLoading={isLoading}
      >
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição *</label>
                  <input
                     className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                     placeholder="Ex: Aluguel, Parcela Notebook"
                     value={description}
                     onChange={e => setDescription(e.target.value)}
                  />
               </div>

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
                        // Converte o valor em inglês para a label em português para exibição
                        value={COMMITMENT_TYPES.find(t => t.value === type)?.label || ''}
                        onChange={(label) => {
                           // Ao selecionar o label, busca e salva o valor correspondente em inglês
                           const found = COMMITMENT_TYPES.find(t => t.label === label)
                           setType((found?.value as CommitmentType) || '')
                        }}
                        options={COMMITMENT_TYPES.map(t => t.label)}
                     />
                  </div>
               </div>
            </div>

            <hr className="border-dashed" />

            {/* Conditional Fields: Fixed / Variable */}
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

            {/* Conditional Fields: Card */}
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