import { useState } from 'react'
import { createIncome } from '@/api/incomes'
import { currencyToNumber, formatCurrency } from '@/utils/formatters'
import { BaseModal } from '../ui/ModalBase'
import { useEffect } from 'react'

interface AddIncomeModalProps {
   isOpen: boolean
   onClose: () => void
   onSave: () => void
}

/**
 * Modal for creating a new income record.
 * Handles validation and state reset upon successful submission.
 */
export function AddIncomeModal({ isOpen, onClose, onSave }: AddIncomeModalProps) {
   const [description, setDescription] = useState('')
   const [expectedDate, setExpectedDate] = useState('')
   const [receivedDate, setReceivedDate] = useState('')
   const [amount, setAmount] = useState('')
   const [isLoading, setIsLoading] = useState(false)

   useEffect(() => {
      if (!isOpen) {
         setDescription('')
         setExpectedDate('')
         setReceivedDate('')
         setAmount('')
         setIsLoading(false)
      }
   }, [isOpen])

   /**
    * Validates required fields and calls the API to persist the new income.
    */
   async function handleSave() {
      const numericAmount = currencyToNumber(amount)

      if (!description || !expectedDate || numericAmount <= 0) {
         alert('Preencha os campos obrigatórios (Descrição, Data prevista e Valor)')
         return
      }

      setIsLoading(true)
      try {
         await createIncome({
            description,
            expectedDate,
            receivedDate,
            amount: numericAmount
         })

         onSave()
         handleClose() // Resets and closes
      } catch (error) {
         console.error("Failed to create income:", error)
         alert("Erro ao salvar a receita. Tente novamente.")
      } finally {
         setIsLoading(false)
      }
   }

   /**
    * Clears the form state and triggers the onClose callback.
    */
   function handleClose() {
      setDescription('')
      setExpectedDate('')
      setReceivedDate('')
      setAmount('')
      onClose()
   }

   return (
      <BaseModal
         isOpen={isOpen}
         onClose={handleClose}
         title="Nova Receita"
         type="create"
         onSave={handleSave}
         isLoading={isLoading}
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

            {/* Receipt Date Field (Optional) */}
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
         </div>
      </BaseModal>
   )
}