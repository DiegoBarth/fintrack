import { useEffect, useState } from 'react'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Commitment } from '@/types/Commitment'
import {
   formatCurrency,
   currencyToNumber,
   numberToCurrency,
   parseLocalDate,
   dateBRToISO
} from '@/utils/formatters'
import { BaseModal } from '@/components/ui/ModalBase'
import { ScopeChoiceModal } from '@/components/ScopeChoiceModal'
import { useCommitment } from '@/hooks/useCommitment'
import { DateField } from '@/components/ui/DateField'
import { format } from "date-fns"

interface EditCommitmentModalProps {
   isOpen: boolean
   commitment: Commitment | null
   onClose: () => void
   onConfirm: (rowIndex: number) => void
}

export function EditCommitmentModal({
   isOpen,
   commitment,
   onClose,
   onConfirm
}: EditCommitmentModalProps) {
   const { month, year } = usePeriod()
   const { update, remove, isSaving, isDeleting } = useCommitment(month, String(year))

   const [amount, setAmount] = useState('')
   const [paymentDate, setPaymentDate] = useState('')
   const [scopeModal, setScopeModal] = useState<'edit' | 'delete' | null>(null)
   const [pendingAction, setPendingAction] = useState<'update' | 'delete' | null>(null)

   useEffect(() => {
      if (commitment) {
         const date = commitment.paymentDate ? dateBRToISO(commitment.paymentDate) : new Date().toISOString().slice(0, 10)

         setAmount(numberToCurrency(commitment.amount))
         setPaymentDate(date)
      }
   }, [commitment])

   const shouldAskScope = (commitment: Commitment) => {
      const isFixed = commitment.type === 'Fixo';
      const isCard = commitment.type === 'Cartão';

      if (isFixed) return true;

      const hasInstallments = (commitment.totalInstallments ?? 1) > 1;
      const notLastInstallment = hasInstallments && commitment.installment !== commitment.totalInstallments;
      return isCard && notLastInstallment;
   };

   const handleUpdate = async () => {
      if (!commitment) return;
      if (shouldAskScope(commitment)) {
         setPendingAction('update');
         setScopeModal('edit');
         return;
      }
      await doUpdate('single');
   };

   const doUpdate = async (scope: 'single' | 'future') => {
      if (!commitment) return;
      await update({
         rowIndex: commitment.rowIndex,
         amount: currencyToNumber(amount),
         paymentDate,
         scope
      });
      setAmount('');
      setPaymentDate('');
      onConfirm(commitment.rowIndex);
      onClose();
   };

   const handleDelete = async () => {
      if (!commitment) return;
      if (shouldAskScope(commitment)) {
         setPendingAction('delete');
         setScopeModal('delete');
         return;
      }
      await doDelete('single');
   };

   const doDelete = async (scope: 'single' | 'future') => {
      if (!commitment) return;
      await remove({ rowIndex: commitment.rowIndex, scope });
      onConfirm(commitment.rowIndex);
      onClose();
   };

   if (!commitment) return null

   return (
      <>
         <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={commitment.description}
            type="edit"
            isLoading={isSaving || isDeleting}
            loadingText={isDeleting ? 'Excluindo...' : 'Salvando...'}
            onSave={handleUpdate}
            onDelete={handleDelete}
         >
            <div>
               <div className="-mt-4 grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
                  <div>
                     Tipo: <span className="font-medium text-foreground">{commitment.type}</span>
                  </div>
                  <div className="justify-self-end">
                     Vencimento: <span className="font-medium text-foreground">{commitment.dueDate}</span>
                  </div>
                  {commitment.card && (
                     <div className="col-span-2">
                        Cartão: <span className="font-medium text-foreground">{commitment.card}</span>
                        {commitment.installment && ` (Parc. ${commitment.installment}/${commitment.totalInstallments})`}
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div>
                     <label htmlFor="edit-commitment-value" className="block text-xs font-medium text-muted-foreground mb-1">
                        Confirmar Valor
                     </label>
                     <input
                        id="edit-commitment-value"
                        aria-label="Valor do compromisso em reais"
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900
                           dark:text-gray-100 rounded-md p-2"
                        value={amount}
                        onChange={e => setAmount(formatCurrency(e.target.value))}
                     />
                  </div>

                  <div>
                     <label
                        htmlFor="edit-commitment-payment-date"
                        className="block text-xs font-medium text-muted-foreground mb-1"
                     >
                        Data de Pagamento
                     </label>
                     <DateField
                        value={paymentDate ? parseLocalDate(paymentDate) : undefined}
                        onChange={(date: Date | undefined) => {
                           if (!date) {
                              setPaymentDate('');
                              return;
                           }
                           setPaymentDate(format(date, "yyyy-MM-dd"));
                        }}
                     />

                     {!commitment.paymentDate && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic">
                           * Preencha para marcar este compromisso como pago.
                        </p>
                     )}
                  </div>
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