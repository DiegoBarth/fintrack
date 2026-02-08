import { useState, useEffect } from 'react';
import { currencyToNumber, formatCurrency } from '../../utils/formatters';
import { createCard, createCommitment } from '../../api/commitments';

interface Props {
   onSave: () => void;
}

export function CommitmentForm({ onSave }: Props) {
   const [description, setDescription] = useState('');
   const [category, setCategory] = useState('');
   const [type, setType] = useState<'fixed' | 'variable' | 'credit_card' | ''>('');

   // fixed / variable
   const [amount, setAmount] = useState('');
   const [dueDate, setDueDate] = useState('');

   const [months, setMonths] = useState(1);
   const [card, setCard] = useState('');
   const [totalAmount, setTotalAmount] = useState('');
   const [totalInstallments, setTotalInstallments] = useState<number | ''>('');
   const [cardDueDate, setCardDueDate] = useState('');

   useEffect(() => {
      if (type === 'fixed' && dueDate) {
         const data = new Date(dueDate);
         const monthsLeft = 12 - data.getMonth();
         setMonths(monthsLeft);
      }
   }, [type, dueDate]);

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      if (!type) return;

      if (type === 'credit_card') {
         await createCard({
            type: 'credit_card',
            description,
            category,
            card,
            totalAmount: currencyToNumber(totalAmount),
            installments: Number(totalInstallments),
            dueDate: cardDueDate
         });
      } else {
         await createCommitment({
            type,
            description,
            category,
            amount: currencyToNumber(amount),
            dueDate,
            months: type === 'fixed' ? months : 1
         });
      }

      onSave();

      // Reset
      setDescription('');
      setCategory('');
      setType('');
      setAmount('');
      setDueDate('');
      setMonths(1);
      setCard('');
      setTotalAmount('');
      setTotalInstallments('');
      setCardDueDate('');
   }

   return (
      <form onSubmit={handleSubmit}>
         <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição"
            required
         />

         <br /><br />

         <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
         >
            <option value="">Categoria</option>
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

         <br /><br />

         <select
            value={type}
            onChange={e => setType(e.target.value as any)}
            required
         >
            <option value="">Tipo</option>
            <option value="fixed">Fixo</option>
            <option value="variable">Variável</option>
            <option value="credit_card">Cartão</option>
         </select>

         <br /><br />
         {(type === 'fixed' || type === 'variable') && (
            <>
               <input
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
                  placeholder="R$ 0,00"
               />

               <br /><br />

               <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
               />

               <br /><br />

               {type === 'fixed' && (
                  <>
                     <label>Repetir por (meses):</label>
                     <input
                        type="number"
                        min={1}
                        max={12}
                        value={months}
                        onChange={e => setMonths(Number(e.target.value))}
                     />
                     <br /><br />
                  </>
               )}
            </>
         )}

         {type === 'credit_card' && (
            <>
               <select value={card} onChange={e => setCard(e.target.value)}>
                  <option value="">Selecione o cartão</option>
                  <option>Bradesco</option>
                  <option>Itaú</option>
                  <option>Mercado Pago</option>
               </select>

               <br /><br />

               <input
                  value={totalAmount}
                  onChange={e => setTotalAmount(formatCurrency(e.target.value))}
                  placeholder="Valor total"
               />

               <br /><br />

               <input
                  type="number"
                  min={1}
                  max={60}
                  value={totalInstallments}
                  onChange={e => setTotalInstallments(Number(e.target.value))}
                  placeholder="Total de parcelas"
               />

               <br /><br />

               <input
                  type="date"
                  value={cardDueDate}
                  onChange={e => setCardDueDate(e.target.value)}
               />

               <br /><br />
            </>
         )}

         <button>Salvar</button>
      </form>
   );
}