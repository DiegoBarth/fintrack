import type { Commitment } from '../../types/Commitment';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   commitments: Commitment[];
   onDelete: (rowIndex: number) => void;

   editingRow: number | null;
   editedAmount: string;
   editedDate: string;

   onEdit: (commitment: Commitment) => void;
   onCancelEdit: () => void;
   onSave: () => void;
   onChangeAmount: (amount: string) => void;
   onChangeDate: (date: string) => void;
}

export function CommitmentGrid({
   commitments,
   onDelete,
   editingRow,
   editedAmount,
   editedDate,
   onEdit,
   onCancelEdit,
   onSave,
   onChangeAmount,
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
                  <td>
                     {c.installment
                        ? `${c.installment}/${c.totalInstallments}`
                        : '-'}
                  </td>
                  <td>
                     {editingRow === c.rowIndex ? (
                        <input
                           type="text"
                           value={editedAmount}
                           onChange={e => onChangeAmount(formatCurrency(e.target.value))}
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
                           <button onClick={() => onEdit(c)}>
                              Editar
                           </button>

                           <button onClick={() => onDelete(c.rowIndex)}>
                              Excluir
                           </button>
                        </>
                     )}

                     {editingRow === c.rowIndex && (
                        <>
                           <button onClick={onSave}>
                              Salvar
                           </button>

                           <button onClick={onCancelEdit}>
                              Cancelar edição
                           </button>
                        </>
                     )}

                  </td>
               </tr>
            ))}
         </tbody>
      </table>
   );
}