import { useEffect, useState } from 'react';
import { listIncomes, deleteIncome, updateIncome } from '../api/incomes';
import type { Income } from '../types/Income';
import { IncomeForm } from '../components/incomes/IncomeForm';
import { IncomeGrid } from '../components/incomes/IncomeGrid';
import {
   numberToCurrency,
   dateBRToISO,
   currencyToNumber
} from '../utils/formatters';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';
import { incomesCache } from '../cache/IncomesCache';

export function Incomes() {
   const { month, year } = usePeriod();
   const [incomes, setIncomes] = useState<Income[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedValue, setEditedValue] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   async function loadData() {
      setLoading(true);
      try {
         const response = await listIncomes(month, String(year));
         setIncomes(response);
      } catch (error) {
         console.error("Error loading incomes:", error);
      } finally {
         setLoading(false);
      }
   }

   async function handleSaveEdit() {
      if (editingRow === null) return;

      await updateIncome({
         rowIndex: editingRow,
         amount: currencyToNumber(editedValue),
         receivedDate: editedDate
      }, month, String(year));

      setEditingRow(null);

      const updated = incomesCache.get(month, year) || [];
      setIncomes(updated);
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir esta receita?')) return;

      await deleteIncome(rowIndex, month, String(year));

      const updated = incomesCache.get(month, year) || [];
      setIncomes(updated);
   }

   function handleEdit(income: Income) {
      setEditingRow(income.rowIndex);
      setEditedValue(numberToCurrency(income.amount));
      setEditedDate(income.receivedDate ? dateBRToISO(income.receivedDate) : '');
   }

   function cancelEdit() {
      setEditingRow(null);
   }

   useEffect(() => {
      loadData();
   }, [month, year]);

   return (
      <div style={{ padding: 16 }}>
         <button
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/')}
         >
            ← Voltar para Home
         </button>

         <h2>Nova receita</h2>
         <IncomeForm
            onSave={() => {
               const updated = incomesCache.get(month, year) || [];
               setIncomes([...updated]);
            }}
         />

         <hr style={{ margin: '24px 0' }} />
         <h2>Consultar receitas</h2>

         {loading ? (
            <p>Carregando receitas...</p>
         ) : (
            <IncomeGrid
               incomes={incomes}
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