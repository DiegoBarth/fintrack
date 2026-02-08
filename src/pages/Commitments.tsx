import { useEffect, useState } from 'react';
import {
   deleteCommitment,
   listCommitments,
   updateCommitment
} from '../api/commitments';
import type { Commitment } from '../types/Commitment';
import { numberToCurrency, dateBRToISO, currencyToNumber } from '../utils/formatters';
import { CommitmentGrid } from '../components/commitments/CommitmentGrid';
import { CommitmentForm } from '../components/commitments/CommitmentForm';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';
import { commitmentsCache } from '../cache/CommitmentsCache';

/**
 * Page component for managing recurring and fixed commitments.
 * Supports scoped operations (single, future, or all occurrences).
 */
export function Commitments() {
   const { month, year } = usePeriod();
   const [commitments, setCommitments] = useState<Commitment[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const [isPersisting, setIsPersisting] = useState(false);

   const navigate = useNavigate();

   /**
    * Loads commitments for the selected period from the API.
    */
   async function loadData() {
      setLoading(true);
      try {
         const res = await listCommitments(month, String(year));
         setCommitments(res);
      } catch (error) {
         console.error("Failed to fetch commitments:", error);
      } finally {
         setLoading(false);
      }
   }

   /**
    * Handles the update of a commitment with scoped persistence.
    * @param scope - Defines if the change affects only the 'single' record or 'future' ones.
    */
   async function handleSaveEdit(scope: 'single' | 'future' = 'single') {
      if (editingRow === null || isPersisting) return;

      setIsPersisting(true);

      try {
         await updateCommitment({
            rowIndex: editingRow,
            amount: currencyToNumber(editedAmount),
            paymentDate: editedDate,
            scope
         }, month, String(year));

         setEditingRow(null);
         const updated = commitmentsCache.get(month, year) || [];
         setCommitments(updated);
      } catch (error) {
         console.error("Failed to update commitment:", error);
      } finally {
         setIsPersisting(false);
      }
   }

   /**
    * Handles commitment deletion with multiple scope options.
    * @param rowIndex - The target row to delete.
    * @param scope - 'single', 'future', or 'all' occurrences.
    */
   async function handleDelete(rowIndex: number, scope: 'single' | 'future' | 'all' = 'single') {
      if (!confirm('Deseja realmente excluir?')) return;

      setIsPersisting(true);

      try {
         await deleteCommitment(rowIndex, month, String(year), scope);
         const updated = commitmentsCache.get(month, year) || [];
         setCommitments(updated);
      } catch (error) {
         console.error("Failed to delete commitment:", error);
      } finally {
         setIsPersisting(false);
      }
   }

   /**
    * Prepares a commitment for editing, formatting the amount and date.
    */
   function handleEdit(commitment: Commitment) {
      setEditingRow(commitment.rowIndex);
      setEditedAmount(numberToCurrency(commitment.amount));
      setEditedDate(commitment.paymentDate ? dateBRToISO(commitment.paymentDate) : '');
   }

   /**
    * Cancels the current editing session.
    */
   function cancelEdit() {
      setEditingRow(null);
   }

   useEffect(() => {
      loadData();
   }, [month, year]);

   return (
      <div style={{ padding: 16 }}>
         <button style={{ marginBottom: 16 }} onClick={() => navigate('/')}>
            ← Voltar para Home
         </button>

         <h2>Novo compromisso</h2>
         <CommitmentForm
            onSave={() => {
               const updated = commitmentsCache.get(month, year) || [];
               setCommitments([...updated]);
            }}
         />

         <hr style={{ margin: '24px 0' }} />
         <h2>Compromissos</h2>

         {loading ? (
            <p>Carregando compromissos...</p>
         ) : (
            <CommitmentGrid
               commitments={commitments}
               onDelete={handleDelete}
               editingRow={editingRow}
               editedAmount={editedAmount}
               editedDate={editedDate}
               onEdit={handleEdit}
               onCancelEdit={cancelEdit}
               onSave={handleSaveEdit}
               onChangeAmount={setEditedAmount}
               onChangeDate={setEditedDate}
               isPersisting={isPersisting}
            />
         )}
      </div>
   );
}