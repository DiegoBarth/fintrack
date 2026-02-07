import type { Income } from '../../types/Income';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   incomes: Income[];
   onDelete: (rowIndex: number) => void;

   editingRow: number | null;
   editedAmount: string;
   editedDate: string;

   onEdit: (income: Income) => void;
   onCancelEdit: () => void;
   onSave: () => void;
   onChangeAmount: (amount: string) => void;
   onChangeDate: (date: string) => void;
}

export function IncomeGrid({
   incomes,
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
               <th>Data prevista</th>
               <th>Data recebimento</th>
               <th>Valor</th>
               <th>Ações</th>
            </tr>
         </thead>

         <tbody>
            {incomes.map(item => (

               <tr key={item.rowIndex}>
                  <td>{item.description}</td>
                  <td>{item.expectedDate}</td>
                  <td>
                     {editingRow === item.rowIndex ? (
                        <input
                           type="date"
                           value={editedDate}
                           onChange={e => onChangeDate(e.target.value)}
                        />
                     ) : (
                        item.receivedDate
                     )}
                  </td>

                  <td>
                     {editingRow === item.rowIndex ? (
                        <input
                           type="text"
                           value={editedAmount}
                           onChange={e => onChangeAmount(formatCurrency(e.target.value))}
                        />
                     ) : (
                        numberToCurrency(item.amount)
                     )}
                  </td>
                  <td>
                     {editingRow !== item.rowIndex && (
                        <>
                           <button onClick={() => onEdit(item)}>
                              Editar
                           </button>

                           <button onClick={() => onDelete(item.rowIndex)}>
                              Excluir
                           </button>
                        </>
                     )}

                     {editingRow === item.rowIndex && (
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