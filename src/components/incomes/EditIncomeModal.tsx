import { useEffect, useState } from 'react'
import { usePeriod } from '@/contexts/PeriodContext'
import { useIncome } from '@/hooks/useIncome'
import type { Income } from '@/types/Income'
import {
   numberToCurrency,
   currencyToNumber,
   dateBRToISO,
   formatCurrency,
   parseLocalDate
} from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { ScopeChoiceModal } from '@/components/ScopeChoiceModal'
import { DateField } from '@/components/ui/DateField'
import { format } from "date-fns"
import { useToast } from '@/contexts/toast';

interface EditIncomeModalProps {
   isOpen: boolean
   income: Income | null
   onClose: () => void
}

export function EditIncomeModal({ isOpen, income, onClose }: EditIncomeModalProps) {
   const { month, year } = usePeriod()
   const { update, remove, isSaving, isDeleting } = useIncome(month, String(year))
   const toast = useToast();

   const [amount, setAmount] = useState('')
   const [receivedDate, setReceivedDate] = useState('')
   const [scopeModal, setScopeModal] = useState<'edit' | 'delete' | null>(null)
   const [pendingAction, setPendingAction] = useState<'update' | 'delete' | null>(null)

   useEffect(() => {
      if (income) {
         setAmount(numberToCurrency(income.amount))
         setReceivedDate(
            income.receivedDate
               ? dateBRToISO(income.receivedDate)
               : new Date().toISOString().slice(0, 10)
         )
      }
   }, [income])


   const handleUpdate = async () => {
      setPendingAction('update');
      setScopeModal('edit');
   };

   const doUpdate = async (scope: 'single' | 'future') => {
      await update({
         rowIndex: income!.rowIndex,
         amount: currencyToNumber(amount),
         receivedDate,
         scope
      });
      toast.success('Receita atualizada com sucesso!');
      setAmount('');
      setReceivedDate('');
      onClose();
   };

   const handleDelete = async () => {
      setPendingAction('delete');
      setScopeModal('delete');
   };

   const doDelete = async (scope: 'single' | 'future') => {
      await remove({ rowIndex: income!.rowIndex, scope });
      toast.success('Receita excluída com sucesso!');
      onClose();
   };

   if (!income) return null

   const isLoading = isSaving || isDeleting

   return (
      <>
         <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={income?.description}
            type="edit"
            isLoading={isLoading}
            loadingText={(isSaving ? 'Salvando...' : 'Excluindo...')}
            onSave={handleUpdate}
            onDelete={handleDelete}
         >
            <div className="space-y-4">
               {/* Amount Field */}
               <div>
                  <label htmlFor="edit-income-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                     Valor
                  </label>
                  <input
                     id="edit-income-amount"
                     aria-label="Valor da receita em reais"
                     className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                        dark:text-gray-100 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                     value={amount}
                     onChange={e => setAmount(formatCurrency(e.target.value))}
                  />
               </div>

               {/* Received Date Field */}
               <div>
                  <label htmlFor="edit-income-received-date" className="block text-xs font-medium text-muted-foreground mb-1">
                     Data de recebimento
                  </label>
                  <DateField
                     value={receivedDate ? parseLocalDate(receivedDate) : undefined}
                     onChange={(date: Date | undefined) => {
                        if (!date) {
                           setReceivedDate('');
                           return;
                        }
                        setReceivedDate(format(date, "yyyy-MM-dd"));
                     }}
                  />
               </div>
            </div>
         </BaseModal>
         <ScopeChoiceModal
            isOpen={!!scopeModal}
            isDelete={scopeModal === 'delete'}
            onClose={() => { setScopeModal(null); setPendingAction(null); }}
            onConfirm={(scope) => {
               setScopeModal(null);
               if (pendingAction === 'update') doUpdate(scope);
               if (pendingAction === 'delete') doDelete(scope);
            }}
         />
      </>
   )
}