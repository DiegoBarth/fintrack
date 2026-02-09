import { useState } from 'react'
import { createExpense } from '@/api/expenses'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '../ui/ModalBase'
import { CustomSelect } from '../ui/SelectCustomizado'

interface AddExpenseModalProps {
   isOpen: boolean
   onClose: () => void
   onSave: () => void
}

const CATEGORIES = [
   "Alimentação", "Banco", "Beleza", "Casa", "Educação",
   "Empréstimos", "Investimento", "Lazer", "Pets", "Presentes",
   "Roupas", "Saúde", "Serviços", "Streaming", "Telefonia",
   "Transporte", "Viagem"
];

/**
 * Modal for creating a new expense.
 * Uses CustomSelect for category picking and BaseModal for consistent UI.
 */
export function AddExpenseModal({ isOpen, onClose, onSave }: AddExpenseModalProps) {
   const [description, setDescription] = useState('')
   const [date, setDate] = useState('')
   const [amount, setAmount] = useState('')
   const [category, setCategory] = useState('');
   const [isLoading, setIsLoading] = useState(false)

   /**
    * Validates and submits the new expense to the API.
    */
   async function handleSave() {
      const numericAmount = currencyToNumber(amount)

      if (!description || !date || !category || numericAmount <= 0) {
         alert('Preencha os campos obrigatórios (Descrição, Data, Categoria e Valor)')
         return
      }

      setIsLoading(true)
      try {
         await createExpense({
            date,
            description,
            category,
            amount: numericAmount
         })

         onSave()
         handleClose()
      } catch (error) {
         console.error("Failed to create expense:", error)
      } finally {
         setIsLoading(false)
      }
   }

   /**
    * Resets form state and closes the modal.
    */
   function handleClose() {
      setDescription('')
      setDate('')
      setCategory('')
      setAmount('')
      onClose()
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={handleClose}
         title="Novo Gasto"
         type="create"
         onSave={handleSave}
         isLoading={isLoading}
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
                  value={date}
                  onChange={e => setDate(e.target.value)}
               />
            </div>

            {/* Category - Custom Select */}
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