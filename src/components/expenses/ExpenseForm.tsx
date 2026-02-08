import { useState } from 'react';
import { createExpense } from '../../api/expenses';
import { currencyToNumber, formatCurrency } from '../../utils/formatters';

interface Props {
   /** Callback function to refresh the list after a successful save */
   onSave: () => void;
}

/**
 * Form component to register new variable expenses.
 * Includes category selection and automatic currency formatting.
 */
export function ExpenseForm({ onSave }: Props) {
   const [date, setDate] = useState('');
   const [description, setDescription] = useState('');
   const [category, setCategory] = useState('');
   const [amount, setAmount] = useState('');
   const [isPersisting, setIsPersisting] = useState(false);

   /**
    * Handles the expense creation process.
    * Validates the amount and synchronizes with the server.
    */
   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const numericAmount = currencyToNumber(amount);
      if (numericAmount <= 0) {
         alert('Valor inválido');
         return;
      }

      setIsPersisting(true);

      try {
         await createExpense({
            date,
            description,
            category,
            amount: numericAmount
         });

         onSave();
         alert('Gasto salvo 💸');

         // Reset form fields
         setDate('');
         setDescription('');
         setCategory('');
         setAmount('');
      } catch (error) {
         console.error("Failed to save expense:", error);
         alert('Erro ao salvar gasto.');
      } finally {
         setIsPersisting(false);
      }
   }

   return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px' }}>Data</label>
            <input
               type="date"
               value={date}
               onChange={e => setDate(e.target.value)}
               disabled={isPersisting}
               required
            />
         </div>

         <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição"
            disabled={isPersisting}
            required
         />

         <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={isPersisting}
            required
         >
            <option value="">Selecione a Categoria</option>
            <option>Alimentação</option>
            <option>Banco</option>
            <option>Beleza</option>
            <option>Casa</option>
            <option>Educação</option>
            <option>Empréstimos</option>
            <option>Investimento</option>
            <option>Lazer</option>
            <option>Pets</option>
            <option>Presentes</option>
            <option>Roupas</option>
            <option>Saúde</option>
            <option>Serviços</option>
            <option>Streaming</option>
            <option>Telefonia</option>
            <option>Transporte</option>
            <option>Viagem</option>
         </select>

         <input
            value={amount}
            onChange={(e) => setAmount(formatCurrency(e.target.value))}
            placeholder="R$ 0,00"
            disabled={isPersisting}
            required
         />

         <button
            type="submit"
            disabled={isPersisting}
            style={{ padding: '0 20px', height: '30px' }}
         >
            {isPersisting ? 'Salvando...' : 'Salvar'}
         </button>
      </form>
   );
}