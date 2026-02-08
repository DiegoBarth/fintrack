import { useState, useEffect } from 'react';
import { currencyToNumber, formatCurrency } from '../../utils/formatters';
import { createCard, createCommitment } from '../../api/commitments';

interface Props {
   /** Callback to refresh the grid after successful submission */
   onSave: () => void;
}

/**
 * Form component to handle different types of financial commitments.
 * Supports: Fixed (recurring), Variable (one-time), and Card (installment-based).
 */
export function CommitmentForm({ onSave }: Props) {
   const [description, setDescription] = useState('');
   const [category, setCategory] = useState('');
   const [type, setType] = useState<'fixed' | 'variable' | 'card' | ''>('');
   const [amount, setAmount] = useState('');
   const [dueDate, setDueDate] = useState('');
   const [months, setMonths] = useState(1);
   const [card, setCard] = useState('');
   const [totalAmount, setTotalAmount] = useState('');
   const [totalInstallments, setTotalInstallments] = useState<number | ''>('');
   const [cardDueDate, setCardDueDate] = useState('');
   const [isPersisting, setIsPersisting] = useState(false);

   /** * Automatically calculates remaining months in the year for fixed commitments 
    */
   useEffect(() => {
      if (type === 'fixed' && dueDate) {
         const date = new Date(dueDate);
         const remainingMonths = 12 - date.getMonth();
         setMonths(remainingMonths);
      }
   }, [type, dueDate]);

   /**
    * Dispatches the correct API call based on the commitment type.
    */
   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!type) return;

      setIsPersisting(true);

      try {
         if (type === 'card') {
            await createCard({
               type: 'card',
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
         alert('Compromisso salvo 💸');

         // Resetting all states
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
      } catch (error) {
         console.error("Error saving commitment:", error);
         alert("Erro ao salvar. Verifique os dados.");
      } finally {
         setIsPersisting(false);
      }
   }

   return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
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

         <select
            value={type}
            onChange={e => setType(e.target.value as any)}
            disabled={isPersisting}
            required
         >
            <option value="">Tipo de Compromisso</option>
            <option value="fixed">Fixo (Mensal)</option>
            <option value="variable">Variável (Único)</option>
            <option value="card">Cartão de Crédito</option>
         </select>

         {/* Fields for Fixed or Variable */}
         {(type === 'fixed' || type === 'variable') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
               <input
                  value={amount}
                  onChange={e => setAmount(formatCurrency(e.target.value))}
                  placeholder="Valor Mensal (R$ 0,00)"
                  disabled={isPersisting}
                  required
               />

               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px' }}>Data de Vencimento</label>
                  <input
                     type="date"
                     value={dueDate}
                     onChange={e => setDueDate(e.target.value)}
                     disabled={isPersisting}
                     required
                  />
               </div>

               {type === 'fixed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <label style={{ fontSize: '14px' }}>Repetir por (meses):</label>
                     <input
                        type="number"
                        min={1}
                        max={12}
                        style={{ width: '60px' }}
                        value={months}
                        onChange={e => setMonths(Number(e.target.value))}
                        disabled={isPersisting}
                     />
                  </div>
               )}
            </div>
         )}

         {/* Fields for Card Purchases */}
         {type === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #007bff', paddingLeft: '10px' }}>
               <select value={card} onChange={e => setCard(e.target.value)} disabled={isPersisting} required>
                  <option value="">Selecione o cartão</option>
                  <option>Bradesco</option>
                  <option>Itaú</option>
                  <option>Mercado Pago</option>
               </select>

               <input
                  value={totalAmount}
                  onChange={e => setTotalAmount(formatCurrency(e.target.value))}
                  placeholder="Valor Total da Compra"
                  disabled={isPersisting}
                  required
               />

               <input
                  type="number"
                  min={1}
                  max={60}
                  value={totalInstallments}
                  onChange={e => setTotalInstallments(Number(e.target.value))}
                  placeholder="Número de Parcelas"
                  disabled={isPersisting}
                  required
               />

               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px' }}>Primeiro Vencimento</label>
                  <input
                     type="date"
                     value={cardDueDate}
                     onChange={e => setCardDueDate(e.target.value)}
                     disabled={isPersisting}
                     required
                  />
               </div>
            </div>
         )}

         <button
            type="submit"
            disabled={isPersisting || !type}
            style={{ marginTop: '10px', padding: '10px', cursor: isPersisting ? 'not-allowed' : 'pointer' }}
         >
            {isPersisting ? 'Salvando...' : 'Salvar Compromisso'}
         </button>
      </form>
   );
}