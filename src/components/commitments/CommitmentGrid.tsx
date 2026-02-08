import type { Commitment } from '../../types/Commitment';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   commitments: Commitment[];
   onDelete: (rowIndex: number, scope?: 'single' | 'future' | 'all') => Promise<void>;

   editingRow: number | null;
   editedValue: string;
   editedDate: string;

   onEdit: (commitment: Commitment) => void;
   onCancelEdit: () => void;
   onSave: (scope?: 'single' | 'future') => Promise<void>;
   onChangeValue: (value: string) => void;
   onChangeDate: (date: string) => void;
}

export function CommitmentGrid({
   commitments,
   onDelete,
   editingRow,
   editedValue,
   editedDate,
   onEdit,
   onCancelEdit,
   onSave,
   onChangeValue,
   onChangeDate
}: Props) {
   return (
      <table border={1} width="100%">
         <thead>
            <tr>
               <th>Descrição</th>
               <th>Categoria</th>
               <th>Parcela</th>
               <th>Valor</th>
               <th>Vencimento</th>
               <th>Pagamento</th>
               <th>Pago</th>
               <th>Ações</th>
            </tr>
         </thead>

         <tbody>
            {commitments.map(c => (

               <tr key={c.rowIndex}>
                  <td>{c.description}</td>
                  <td>{c.category}</td>
                  <td>{c.installment ? `${c.installment}/${c.totalInstallments}` : '-'}</td>
                  <td>
                     {editingRow === c.rowIndex ? (
                        <input
                           type="text"
                           value={editedValue}
                           onChange={e => onChangeValue(formatCurrency(e.target.value))}
                        />
                     ) : (
                        numberToCurrency(c.amount)
                     )}
                  </td>
                  <td>{c.dueDate}</td>
                  <td>
                     {editingRow === c.rowIndex ? (
                        <input
                           type="date"
                           value={editedDate}
                           onChange={e => onChangeDate(e.target.value)}
                        />
                     ) : (
                        c.paymentDate
                     )}
                  </td>
                  <td>
                     <input type="checkbox" checked={c.paid} readOnly />
                  </td>
                  <td>
                     {editingRow !== c.rowIndex && (
                        <>
                           <button onClick={() => onEdit(c)}>Editar</button>

                           <button onClick={() => {
                              let scope: 'single' | 'future' | 'all' = 'single';

                              if (c.type === 'fixed') {
                                 const resposta = prompt(
                                    'Excluir apenas esta parcela (single), todas futuras (future) ou todas (all)?',
                                    'single'
                                 );
                                 if (!resposta || !['single', 'future', 'all'].includes(resposta)) return;
                                 scope = resposta as 'single' | 'future' | 'all';
                              }
                              onDelete(c.rowIndex, scope);
                           }}>
                              Excluir
                           </button>
                        </>
                     )}

                     {editingRow === c.rowIndex && (
                        <>
                           <button onClick={() => {
                              let scope: 'single' | 'future' = 'single';

                              if (c.type === 'fixed') {
                                 const resposta = prompt(
                                    'Salvar apenas esta parcela (single) ou todas futuras (future)?',
                                    'single'
                                 );
                                 if (!resposta || !['single', 'future'].includes(resposta)) return;
                                 scope = resposta as 'single' | 'future';
                              }

                              onSave(scope);
                           }}>
                              Salvar
                           </button>

                           <button onClick={onCancelEdit}>Cancelar edição</button>
                        </>
                     )}

                  </td>
               </tr>
            ))}
         </tbody>
      </table >
   );
}