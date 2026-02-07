import { useEffect, useState } from 'react';
import { listIncomes, deleteIncome, updateIncome } from '../api/incomes';
import type { Income } from '../types/Income';
import { IncomeForm } from '../components/incomes/IncomeForm';
import { IncomeGrid } from '../components/incomes/IncomeGrid';
import { numberToCurrency, dateBRToISO, currencyToNumber } from '../utils/formatters';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';

export function Incomes() {
   const { month, year } = usePeriod(); // Consome o contexto global
   const [incomes, setIncomes] = useState<Income[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   async function fetchIncomes() {
      setLoading(true);
      try {
         const res = await listIncomes(month, String(year));
         setIncomes(res);
      } catch (error) {
         console.error("Failed to fetch incomes:", error);
      } finally {
         setLoading(false);
      }
   }

   async function handleSaveEdit() {
      if (editingRow === null) return;

      await updateIncome({
         rowIndex: editingRow,
         amount: currencyToNumber(editedAmount),
         receivedDate: editedDate
      }, month, String(year));

      setEditingRow(null);
      fetchIncomes();
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir esta receita?')) return;

      await deleteIncome(rowIndex, month, String(year));
      setIncomes(prev => prev.filter(item => item.rowIndex !== rowIndex));
   }

   function handleEdit(income: Income) {
      setEditingRow(income.rowIndex);
      setEditedAmount(numberToCurrency(income.amount));
      setEditedDate(income.expectedDate ? dateBRToISO(income.expectedDate) : '');
   }

   function cancelEdit() {
      setEditingRow(null);
   }

   useEffect(() => {
      fetchIncomes();
   }, [month, year]);

   return (
      <>
         <button
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/')}
         >
            ← Voltar para Home
         </button>

         <h2>Nova receita</h2>
         <IncomeForm onSave={fetchIncomes} />

         <hr />
         <h2>Consultar receitas</h2>

         {loading ? (
            <p>Carregando...</p>
         ) : (
            <IncomeGrid
               incomes={incomes}
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
      </>
   );
}