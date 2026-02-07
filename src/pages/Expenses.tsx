import { useEffect, useState } from 'react';
import { listExpenses, deleteExpense, updateExpense } from '../api/expenses';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseGrid } from '../components/expenses/ExpenseGrid';
import type { Expense } from '../types/Expense';
import { numberToCurrency, dateBRToISO, currencyToNumber } from '../utils/formatters';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';

export function Expenses() {
   const { month, year } = usePeriod();
   const [expenses, setExpenses] = useState<Expense[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   async function fetchExpenses() {
      setLoading(true);
      try {
         const res = await listExpenses(month, String(year));
         setExpenses(res);
      } catch (error) {
         console.error("Failed to fetch expenses:", error);
      } finally {
         setLoading(false);
      }
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir este gasto?')) return;

      await deleteExpense(rowIndex);
      setExpenses(prev => prev.filter(item => item.rowIndex !== rowIndex));
   }

   function handleEdit(expense: Expense) {
      setEditingRow(expense.rowIndex);
      setEditedAmount(numberToCurrency(expense.amount));
      setEditedDate(dateBRToISO(expense.paymentDate));
   }

   function cancelEdit() {
      setEditingRow(null);
   }

   async function handleSaveEdit() {
      if (editingRow === null) return;

      await updateExpense({
         rowIndex: editingRow,
         amount: currencyToNumber(editedAmount),
         date: editedDate
      });

      setEditingRow(null);
      fetchExpenses();
   }

   useEffect(() => {
      fetchExpenses();
   }, [month, year]);

   return (
      <>
         <button
            style={{ marginBottom: 16 }}
            onClick={() => navigate('/')}
         >
            ← Voltar para Home
         </button>

         <h2>Novo gasto</h2>
         <ExpenseForm onSave={fetchExpenses} />

         <hr />

         <h2>Consultar gastos</h2>

         {loading ? (
            <p>Carregando...</p>
         ) : (
            <ExpenseGrid
               expenses={expenses}
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