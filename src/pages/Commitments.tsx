import { useEffect, useState } from 'react';
import {
   deleteCommitment,
   listCommitments,
   updateCommitment
} from '../api/commitments';
import type { Commitment } from '../types/Commitment';
import {
   numberToCurrency,
   dateBRToISO,
   currencyToNumber
} from '../utils/formatters';
import { CommitmentGrid } from '../components/commitments/CommitmentGrid';
import { CommitmentForm } from '../components/commitments/CommitmentForm';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';
import { commitmentsCache } from '../cache/CommitmentsCache';

export function Commitments() {
   const { month, year } = usePeriod();
   const [commitments, setCommitments] = useState<Commitment[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedValue, setEditedValue] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   async function loadData() {
      setLoading(true);
      try {
         const response = await listCommitments(month, String(year));
         setCommitments(response);
      } catch (error) {
         console.error("Error fetching commitments:", error);
      } finally {
         setLoading(false);
      }
   }

   async function handleSaveEdit(scope: 'single' | 'future' = 'single') {
      if (editingRow === null) return;

      await updateCommitment({
         rowIndex: editingRow,
         amount: currencyToNumber(editedValue),
         paymentDate: editedDate,
         scope
      }, month, String(year));

      setEditingRow(null);
      const updated = commitmentsCache.get(month, year) || [];
      setCommitments(updated);
   }

   async function handleDelete(rowIndex: number, scope: 'single' | 'future' | 'all' = 'single') {
      if (!confirm('Deseja realmente excluir este compromisso?')) return;

      await deleteCommitment(rowIndex, month, String(year), scope);
      const updated = commitmentsCache.get(month, year) || [];
      setCommitments(updated);
   }

   function handleEdit(commitment: Commitment) {
      setEditingRow(commitment.rowIndex);
      setEditedValue(numberToCurrency(commitment.amount));
      setEditedDate(commitment.paymentDate ? dateBRToISO(commitment.paymentDate) : '');
   }

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
               editedValue={editedValue}
               editedDate={editedDate}
               onEdit={handleEdit}
               onCancelEdit={cancelEdit}
               onSave={handleSaveEdit}
               onChangeValue={setEditedValue}
               onChangeDate={setEditedDate}
            />
         )}
      </div>
   );
}