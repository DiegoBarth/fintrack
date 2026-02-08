import { useState } from 'react';
import { createIncome } from '../../api/incomes';
import { currencyToNumber, formatCurrency } from '../../utils/formatters';

interface Props {
   onSave: () => void;
}

export function IncomeForm({ onSave }: Props) {
   const [expectedDate, setExpectedDate] = useState('');
   const [receivedDate, setReceivedDate] = useState('');
   const [description, setDescription] = useState('');
   const [amount, setAmount] = useState('');

   async function handleSave(e: React.FormEvent) {
      e.preventDefault();

      const amountNumber = currencyToNumber(amount);
      if (amountNumber <= 0) {
         alert('Valor inválido');
         return;
      }

      await createIncome({
         expectedDate,
         receivedDate,
         description,
         amount: amountNumber
      });

      onSave();
      alert('Receita salva 💸');

      setExpectedDate('');
      setReceivedDate('');
      setDescription('');
      setAmount('');
   }

   return (
      <form onSubmit={handleSave}>
         <input
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
         />

         <input
            type="date"
            title="Data prevista"
            value={expectedDate}
            onChange={e => setExpectedDate(e.target.value)}
            required
         />

         <input
            type="date"
            title="Data recebimento"
            value={receivedDate}
            onChange={e => setReceivedDate(e.target.value)}
         />

         <input
            placeholder="Valor"
            value={amount}
            onChange={e => setAmount(formatCurrency(e.target.value))}
            required
         />

         <button type="submit">Salvar receita</button>
      </form>
   );
}