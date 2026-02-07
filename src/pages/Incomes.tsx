import { useEffect, useState } from 'react';
import { listIncomes, deleteIncome, updateIncome } from '../api/incomes';
import { IncomeForm } from '../components/incomes/IncomeForm';
import { IncomeGrid } from '../components/incomes/IncomeGrid';
import type { Income } from '../types/Income';
import { numberToCurrency, dateBRToISO, currencyToNumber } from '../utils/formatters';

export function Incomes() {
   const today = new Date();

   const [month, setMonth] = useState(String(today.getMonth() + 1));
   const [year, setYear] = useState(String(today.getFullYear()));
   const [incomes, setIncomes] = useState<Income[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedAmount, setEditedAmount] = useState('');
   const [editedDate, setEditedDate] = useState('');

   async function fetchIncomes() {
      const res = await listIncomes(month, year);
      setIncomes(res);
   }

   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir esta receita?')) return;

      await deleteIncome(rowIndex);

      setIncomes(prev =>
         prev.filter(item => item.rowIndex !== rowIndex)
      );
   }

   function handleEdit(income: Income) {
      setEditingRow(income.rowIndex);
      setEditedAmount(numberToCurrency(income.amount));
      setEditedDate(income.expectedDate
         ? dateBRToISO(income.expectedDate)
         : '');
   }

   function cancelEdit() {
      setEditingRow(null);
   }

   async function handleSaveEdit() {
      if (editingRow === null) return;

      await updateIncome({
         rowIndex: editingRow,
         amount: currencyToNumber(editedAmount),
         receivedDate: editedDate
      });

      setEditingRow(null);
      fetchIncomes();
   }

   useEffect(() => {
      fetchIncomes();
   }, []);

   return (
      <>
         <h2>Nova receita</h2>
         <IncomeForm onSave={fetchIncomes} />

         <hr />

         <h2>Consultar receitas</h2>

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
         <button onClick={fetchIncomes}>Buscar</button>

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
      </>
   );
}