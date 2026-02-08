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

/**
 * Page component for managing income records.
 * Handles fetching, editing, and deleting incomes with local cache synchronization.
 */
export function Incomes() {
   const { month, year } = usePeriod(); // hooks into global period context
   const [incomes, setIncomes] = useState<Income[]>([]);
   const [editingRow, setEditingRow] = useState<number | null>(null);
   const [editedValue, setEditedValue] = useState('');
   const [editedDate, setEditedDate] = useState('');
   const [loading, setLoading] = useState(false);
   const [isPersisting, setIsPersisting] = useState(false);

   const navigate = useNavigate();

   /**
    * Handles the update of an existing income record.
    * Prevents multiple submissions using the isPersisting flag.
    */
   async function handleSaveEdit() {
      if (editingRow === null || isPersisting) return;

      setIsPersisting(true);

      try {
         await updateIncome({
            rowIndex: editingRow,
            amount: currencyToNumber(editedValue),
            receivedDate: editedDate
         }, month, String(year));

         setEditingRow(null);

         // Sync local state with updated cache
         const updated = incomesCache.get(month, year) || [];
         setIncomes(updated);
      } catch (error) {
         console.error("Failed to update income:", error);
      } finally {
         setIsPersisting(false);
      }
   }

   /**
    * Fetches the list of incomes for the current period from the API.
    */
   async function loadData() {
      setLoading(true);
      try {
         const res = await listIncomes(month, String(year));
         setIncomes(res);
      } catch (error) {
         console.error("Failed to load incomes:", error);
      } finally {
         setLoading(false);
      }
   }

   /**
    * Handles income deletion after user confirmation.
    * @param rowIndex - The unique row index of the record to delete.
    */
   async function handleDelete(rowIndex: number) {
      if (!confirm('Deseja realmente excluir esta receita?')) return;

      setIsPersisting(true);

      try {
         await deleteIncome(rowIndex, month, String(year));

         const updated = incomesCache.get(month, year) || [];
         setIncomes(updated);
      } catch (error) {
         console.error("Failed to delete income:", error);
      } finally {
         setIsPersisting(false);
      }
   }

   /**
    * Prepares the UI for editing a specific income record.
    */
   function handleEdit(income: Income) {
      setEditingRow(income.rowIndex);
      setEditedValue(numberToCurrency(income.amount));
      setEditedDate(income.receivedDate ? dateBRToISO(income.receivedDate) : '');
   }

   /**
    * Resets the editing state and clears temporary fields.
    */
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
               isPersisting={isPersisting}
            />
         )}
      </div>
   );
}