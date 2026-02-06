import { useEffect, useState } from 'react';
import { listExpenses, deleteExpense, updateExpense } from '../api/expenses';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseGrid } from '../components/expenses/ExpenseGrid';
import type { Expense } from '../types/Expense';
import { numberToCurrency, dateBRToISO, currencyToNumber } from '../utils/formatters';

export function Expenses() {
   const today = new Date();

   const [month, setMonth] = useState(String(today.getMonth() + 1));
   const [year, setYear] = useState(String(today.getFullYear()));
   const [expenses, setExpenses] = useState<Expense[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');

   async function fetchExpenses() {
      const res = await listExpenses(month, year);
      setExpenses(res);
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir este gasto?')) return;

      await deleteExpense(rowIndex);

      setExpenses(prev =>
         prev.filter(item => item.rowIndex !== rowIndex)
      );
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
   }, []);

   return (
      <>
         <h2>Novo gasto</h2>
         <ExpenseForm onSave={fetchExpenses} />

         <hr />

         <h2>Consultar gastos</h2>

         <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="all">Ano todo</option>
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

         <input value={year} onChange={e => setYear(e.target.value)} />
         <button onClick={fetchExpenses}>Buscar</button>

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
      </>
   );
}