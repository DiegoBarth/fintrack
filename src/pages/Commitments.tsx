import { useEffect, useState } from 'react';
import {
   deleteCommitment,
   listCommitments,
   updateCommitment,
   createCard,
   createCommitment
} from '../api/commitments';
import type { Commitment } from '../types/Commitment';
import { numberToCurrency, dateBRToISO, currencyToNumber } from '../utils/formatters';
import { CommitmentGrid } from '../components/commitments/CommitmentGrid';
import { CommitmentForm } from '../components/commitments/CommitmentForm';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';

export function Commitments() {
   const { month, year } = usePeriod();
   const [commitments, setCommitments] = useState<Commitment[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   async function handleSave(payload: any) {
      if (payload.type === 'card') {
         await createCard(payload, month, String(year));
      } else {
         await createCommitment(payload);
      }
      await fetchCommitments();
   }

   async function fetchCommitments() {
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

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir este compromisso?')) return;

      await deleteCommitment(rowIndex, month, String(year));
      setCommitments(prev => prev.filter(c => c.rowIndex !== rowIndex));
   }

   function handleEdit(commitment: Commitment) {
      setEditingRow(commitment.rowIndex);
      setEditedAmount(numberToCurrency(commitment.amount));
      setEditedDate(commitment.paymentDate ? dateBRToISO(commitment.paymentDate) : '');
   }

   function cancelEdit() {
      setEditingRow(null);
   }

   async function handleSaveEdit() {
      if (editingRow === null) return;

      await updateCommitment({
         rowIndex: editingRow,
         amount: currencyToNumber(editedAmount),
         paymentDate: editedDate
      }, month, String(year));

      setEditingRow(null);
      fetchCommitments();
   }

   useEffect(() => {
      fetchCommitments();
   }, [month, year]);

   return (
      <div>
         <button
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/')}
         >
            ← Voltar para Home
         </button>

         <h2>Novo compromisso</h2>
         <CommitmentForm onSave={handleSave} />

         <hr />
         <h2>Compromissos</h2>

         {loading ? (
            <p>Carregando...</p>
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
            />
         )}
      </div>
   );
}