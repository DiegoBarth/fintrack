import { useState } from 'react';
import { createExpense } from '../../api/expenses';
import { currencyToNumber, formatCurrency } from '../../utils/formatters';

interface Props {
   onSave: () => void;
}

export function ExpenseForm({ onSave }: Props) {
   const [date, setDate] = useState('');
   const [description, setDescription] = useState('');
   const [category, setCategory] = useState('');
   const [amount, setAmount] = useState('');

   async function handleSave(e: React.FormEvent) {
      e.preventDefault();

      const amountNumber = currencyToNumber(amount);
      if (amountNumber <= 0) {
         alert('Valor inválido');
         return;
      }

      await createExpense({
         date,
         description,
         category,
         amount: amountNumber
      });

      onSave();
      alert('Gasto salvo 💸');
      
      // Reset
      setDate('');
      setDescription('');
      setCategory('');
      setAmount('');
   }

   return (
      <form onSubmit={handleSave}>
         <input type="date" value={date} onChange={e => setDate(e.target.value)} />
         <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" />

         <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Selecione</option>
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
            onChange={(e) => {
               setAmount(formatCurrency(e.target.value));
            }}
            placeholder="R$ 0,00"
         />

         <button>Salvar</button>
      </form>
   );
}