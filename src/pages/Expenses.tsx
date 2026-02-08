import { useEffect, useState } from 'react';
import { listExpenses, deleteExpense, updateExpense } from '../api/expenses';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseGrid } from '../components/expenses/ExpenseGrid';
import type { Expense } from '../types/Expense';
import { numberToCurrency, currencyToNumber } from '../utils/formatters';
import { usePeriod } from '../contexts/PeriodContext';
import { useNavigate } from 'react-router-dom';
import { expensesCache } from '../cache/ExpensesCache';

/**
 * Page component to manage variable expenses.
 * Handles loading, editing, and deleting expenses with persistence and cache sync.
 */
export function Expenses() {
   const { month, year } = usePeriod();
   const [expenses, setExpenses] = useState<Expense[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [loading, setLoading] = useState(false);
   const [isPersisting, setIsPersisting] = useState(false);
   
   const navigate = useNavigate();

   /**
    * Fetches the expenses for the currently selected period.
    */
   async function loadData() {
      setLoading(true);
      try {
         const res = await listExpenses(month, String(year));
         setExpenses(res);
      } catch (error) {
         console.error("Failed to load expenses:", error);
      } finally {
         setLoading(false);
      }
   }

   /**
    * Handles the deletion of an expense record.
    * @param rowIndex - The unique identifier for the row in the spreadsheet.
    */
   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir este gasto?')) return;

      setIsPersisting(true);
      try {
         await deleteExpense(rowIndex, month, String(year));

         const updated = expensesCache.get(month, year) || [];
         setExpenses(updated);
      } catch (error) {
         console.error("Failed to delete expense:", error);
      } finally {
         setIsPersisting(false);
      }
   }

   /**
    * Prepares a row for inline editing by populating temporary state.
    */
   function handleEdit(expense: Expense) {
      setEditingRow(expense.rowIndex);
      setEditedAmount(numberToCurrency(expense.amount));
   }

   /**
    * Clears the editing state without saving changes.
    */
   function cancelEdit() {
      setEditingRow(null);
   }

   /**
    * Persists the edited amount to the server and updates local state/cache.
    */
   async function handleSaveEdit() {
      if (editingRow === null || isPersisting) return;

      setIsPersisting(true);
      try {
         await updateExpense(
            {
               rowIndex: editingRow,
               amount: currencyToNumber(editedAmount)
            },
            month,
            String(year)
         );

         setEditingRow(null);

         const updated = expensesCache.get(month, year) || [];
         setExpenses(updated);
      } catch (error) {
         console.error("Failed to update expense amount:", error);
      } finally {
         setIsPersisting(false);
      }
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
            <p>Carregando gastos...</p>
         ) : (
            <ExpenseGrid
               expenses={expenses}
               onDelete={handleDelete}
               editingRow={editingRow}
               editedAmount={editedAmount}
               onEdit={handleEdit}
               onCancelEdit={cancelEdit}
               onSave={handleSaveEdit}
               onChangeAmount={setEditedAmount}
               isPersisting={isPersisting}
            />
         )}
      </div>
   );
}