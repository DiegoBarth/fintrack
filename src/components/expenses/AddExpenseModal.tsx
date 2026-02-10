import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense } from '@/api/endpoints/expenses'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/SelectCustomizado'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Expense } from '@/types/Expense'

interface AddExpenseModalProps {
   isOpen: boolean
   onClose: () => void
}

const CATEGORIES = [
   "Alimentação", "Banco", "Beleza", "Casa", "Educação",
   "Empréstimos", "Investimento", "Lazer", "Pets", "Presentes",
   "Roupas", "Saúde", "Serviços", "Streaming", "Telefonia",
   "Transporte", "Viagem"
];

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
   const { month, year } = usePeriod()
   const queryClient = useQueryClient()

   const [description, setDescription] = useState('')
   const [date, setDate] = useState('')
   const [amount, setAmount] = useState('')
   const [category, setCategory] = useState('')

   // Reseta o formulário ao fechar/abrir
   useEffect(() => {
      if (!isOpen) {
         setDescription('')
         setDate('')
         setCategory('')
         setAmount('')
      }
   }, [isOpen])

   /* =========================
      MUTATION
      ========================= */
   const createMutation = useMutation({
      mutationFn: () => {
         const numericAmount = currencyToNumber(amount)

         if (!description || !date || !category || numericAmount <= 0) {
            throw new Error('MISSING_FIELDS')
         }

         return createExpense({
            date,
            description,
            category,
            amount: numericAmount
         })
      },
      onSuccess: (newExpense) => {
         queryClient.setQueryData<Expense[]>(
            ['expenses', month, year],
            old => old ? [...old, newExpense] : [newExpense]
         )
         onClose()
      },
      onError: (error: any) => {
         if (error.message === 'MISSING_FIELDS') {
            alert('Preencha os campos obrigatórios (Descrição, Data, Categoria e Valor)')
         } else {
            console.error("Failed to create expense:", error)
         }
      }
   })

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Novo Gasto"
         type="create"
         isLoading={createMutation.isPending}
         onSave={() => createMutation.mutate()}
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

            {/* Category */}
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