import { useEffect, useState } from 'react';
import {
   deleteCommitment,
   listCommitments,
   updateCommitment,
   createCard,
   createCommitment
} from '../api/commitments';
import type { Commitment } from '../types/Commitment';
import {
   numberToCurrency,
   dateBRToISO,
   currencyToNumber
} from '../utils/formatters';
import { CommitmentGrid } from '../components/commitments/CommitmentGrid';
import { CommitmentForm } from '../components/commitments/CommitmentForm';

export function Commitments() {
   const today = new Date();

   const [month, setMonth] = useState(String(today.getMonth() + 1));
   const [year, setYear] = useState(String(today.getFullYear()));
   const [commitments, setCommitments] = useState<Commitment[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');

   async function handleSave(payload: any) {
      if (payload.type === 'credit_card') {
         await createCard(payload);
      } else {
         await createCommitment(payload);
      }

      await fetchCommitments();
   }

   async function fetchCommitments() {
      const res = await listCommitments(month, year);
      setCommitments(res);
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir este gasto?')) return;

      await deleteCommitment(rowIndex);

      setCommitments(prev =>
         prev.filter(item => item.rowIndex !== rowIndex)
      );
   }

   function handleEdit(commitment: Commitment) {
      setEditingRow(commitment.rowIndex);
      setEditedAmount(numberToCurrency(commitment.amount));
      setEditedDate(commitment.paymentDate
         ? dateBRToISO(commitment.paymentDate)
         : '');
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
      });

      setEditingRow(null);
      fetchCommitments();
   }

   useEffect(() => {
      fetchCommitments();
   }, []);

   return (
      <div>
         <h2>Novo compromisso</h2>
         <CommitmentForm onSave={handleSave} />

         <hr />
         <h2>Compromissos</h2>

         {/* filtros */}
         <div style={{ marginBottom: 16 }}>
            <select value={month} onChange={e => setMonth(e.target.value)}>
               <option value="all">Ano inteiro</option>
               <option value="1">Janeiro</option>
               <option value="2">Fevereiro</option>
               <option value="3">Março</option>
               <option value="4">Abril</option>
               <option value="5">Maio</option>
               <option value="6">Junho</option>
               <option value="7">Julho</option>
               <option value="8">Agosto</option>
               <option value="9">Setembro</option>
               <option value="10">Outubro</option>
               <option value="11">Novembro</option>
               <option value="12">Dezembro</option>
            </select>

            <input
               type="number"
               value={year}
               onChange={e => setYear(e.target.value)}
               style={{ marginLeft: 8 }}
            />

            <button onClick={fetchCommitments} style={{ marginLeft: 8 }}>
               Buscar
            </button>
         </div>

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

      </div>
   );
}