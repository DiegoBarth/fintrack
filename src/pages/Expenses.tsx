import { useEffect, useState } from 'react';
import { listExpenses, deleteExpense, updateExpense } from '../api/expenses';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseGrid } from '../components/expenses/ExpenseGrid';
import type { Expense } from '../types/Expense';
import {
   numberToCurrency, currencyToNumber  } from '../utils/formatters';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';
import { expensesCache } from '../cache/ExpensesCache';

export function Expenses() {
   const { month, year } = usePeriod();
   const [expenses, setExpenses] = useState<Expense[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedValue, setEditedValue] = useState('');
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   async function loadData() {
      setLoading(true);
      try {
         const response = await listExpenses(month, String(year));
         setExpenses(response);
      } catch (error) {
         console.error("Error loading expenses:", error);
      } finally {
         setLoading(false);
      }
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir este gasto?')) return;

      await deleteExpense(rowIndex, month, String(year));

      const updated = expensesCache.get(month, year) || [];
      setExpenses(updated);
   }

   function handleEdit(expense: Expense) {
      setEditingRow(expense.rowIndex);
      setEditedValue(numberToCurrency(expense.amount));
   }

   function cancelEdit() {
      setEditingRow(null);
   }

   async function handleSaveEdit() {
      if (editingRow === null) return;

      await updateExpense({
         rowIndex: editingRow,
         amount: currencyToNumber(editedValue)
      }, month, String(year));

      setEditingRow(null);

      const updated = expensesCache.get(month, year) || [];
      setExpenses(updated);
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

         <h2>Novo gasto</h2>
         <ExpenseForm
            onSave={() => {
               const updated = expensesCache.get(month, year) || [];
               setExpenses([...updated]);
            }}
         />

         <hr style={{ margin: '24px 0' }} />

         <h2>Consultar gastos</h2>

         {loading ? (
            <p>Carregando...</p>
         ) : (
            <ExpenseGrid
               expenses={expenses}
               onDelete={handleDelete}
               editingRow={editingRow}
               editedValue={editedValue}
               onEdit={handleEdit}
               onCancelEdit={cancelEdit}
               onSave={handleSaveEdit}
               onChangeValue={setEditedValue}
            />
         )}
      </div>
   );
}