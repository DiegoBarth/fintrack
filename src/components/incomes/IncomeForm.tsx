import { useState } from 'react';
import { createIncome } from '../../api/incomes';
import { currencyToNumber, formatCurrency } from '../../utils/formatters';

interface Props {
   /** Callback function to be executed after a successful save operation */
   onSave: () => void;
}

/**
 * Form component to create new income records.
 * Manages local form state and handles communication with the income API.
 */
export function IncomeForm({ onSave }: Props) {
   const [expectedDate, setExpectedDate] = useState('');
   const [receivedDate, setReceivedDate] = useState('');
   const [description, setDescription] = useState('');
   const [value, setValue] = useState('');
   const [isPersisting, setIsPersisting] = useState(false);

   /**
    * Handles the form submission.
    * Validates the input, sends data to the API, and resets the form upon success.
    */
   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const numericValue = currencyToNumber(value);
      if (numericValue <= 0) {
         alert('Valor inválido');
         return;
      }

      setIsPersisting(true);

      try {
         await createIncome({
            expectedDate,
            receivedDate,
            description,
            amount: numericValue
         });

         // Notify parent component and reset local state
         onSave();
         alert('Receita salva 💸');

         setExpectedDate('');
         setReceivedDate('');
         setDescription('');
         setValue('');
      } catch (error) {
         console.error("Error creating income:", error);
         alert('Erro ao salvar receita. Tente novamente.');
      } finally {
         setIsPersisting(false);
      }
   }

   return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
         <input
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isPersisting}
            required
         />

         <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px' }}>Data prevista</label>
            <input
               type="date"
               value={expectedDate}
               onChange={e => setExpectedDate(e.target.value)}
               disabled={isPersisting}
               required
            />
         </div>

         <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px' }}>Data recebimento</label>
            <input
               type="date"
               value={receivedDate}
               onChange={e => setReceivedDate(e.target.value)}
               disabled={isPersisting}
            />
         </div>

         <input
            placeholder="Valor"
            value={value}
            onChange={e => setValue(formatCurrency(e.target.value))}
            disabled={isPersisting}
            required
         />

         <button
            type="submit"
            disabled={isPersisting}
            style={{ padding: '0 20px', cursor: isPersisting ? 'not-allowed' : 'pointer' }}
         >
            {isPersisting ? 'Salvando...' : 'Salvar'}
         </button>
      </form>
   );
}