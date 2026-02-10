import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIncome } from '@/api/endpoints/incomes'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Income } from '@/types/Income'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'

interface AddIncomeModalProps {
   isOpen: boolean
   onClose: () => void
}

/**
 * Modal for creating a new income record.
 * Uses TanStack Query for state management and cache updates.
 */
export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
   const { month, year } = usePeriod()
   const queryClient = useQueryClient()

   const [description, setDescription] = useState('')
   const [expectedDate, setExpectedDate] = useState('')
   const [receivedDate, setReceivedDate] = useState('')
   const [amount, setAmount] = useState('')

   // Reseta o formulário ao fechar o modal
   useEffect(() => {
      if (!isOpen) {
         setDescription('')
         setExpectedDate('')
         setReceivedDate('')
         setAmount('')
      }
   }, [isOpen])

   const createMutation = useMutation({
      mutationFn: () => {
         const numericAmount = currencyToNumber(amount)

         if (!description || !expectedDate || numericAmount <= 0) {
            throw new Error('MISSING_FIELDS')
         }

         return createIncome({
            description,
            expectedDate,
            receivedDate,
            amount: numericAmount
         })
      },
      onSuccess: (newIncome: Income) => {
         queryClient.setQueryData<Income[]>(
            ['incomes', month, year],
            old => old ? [...old, newIncome] : [newIncome]
         )
         onClose()
      },
      onError: (error: any) => {
         if (error.message === 'MISSING_FIELDS') {
            alert('Preencha os campos obrigatórios (Descrição, Data prevista e Valor)')
         } else {
            console.error("Failed to create income:", error)
            alert("Erro ao salvar a receita. Tente novamente.")
         }
      }
   })

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={onClose}
         title="Nova Receita"
         type="create"
         isLoading={createMutation.isPending}
         loadingText="Salvando..."
         onSave={() => createMutation.mutate()}
      >
         <div className="space-y-4">
            {/* Description Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Descrição *
               </label>
               <input
                  placeholder="Ex: Salário, Venda de Produto"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
               />
            </div>

            {/* Amount Field */}
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

            {/* Expected Date Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data Prevista *
               </label>
               <input
                  type="date"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
               />
            </div>

            {/* Receipt Date Field */}
            <div>
               <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Data de Recebimento (opcional)
               </label>
               <input
                  type="date"
                  className="w-full rounded-md border border-input p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={receivedDate}
                  onChange={e => setReceivedDate(e.target.value)}
               />
            </div>
         </div>
      </BaseModal>
   )
}