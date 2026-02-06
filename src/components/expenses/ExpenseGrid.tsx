import type { Expense } from '../../types/Expense';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   expenses: Expense[];
   onDelete: (rowIndex: number) => void;

   editingRow: number | null;
   editedAmount: string;
   editedDate: string;

   onEdit: (expense: Expense) => void;
   onCancelEdit: () => void;
   onSave: () => void;
   onChangeAmount: (amount: string) => void;
   onChangeDate: (date: string) => void;
}

export function ExpenseGrid({
   expenses,
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
               <th>Valor</th>
               <th>Data</th>
               <th>Ações</th>
            </tr>
         </thead>

         <tbody>
            {expenses.map(e => (

               <tr key={e.rowIndex}>
                  <td>{e.description}</td>
                  <td>{e.category}</td>
                  <td>
                     {editingRow === e.rowIndex ? (
                        <input
                           type="text"
                           value={editedAmount}
                           onChange={event => onChangeAmount(formatCurrency(event.target.value))}
                        />
                     ) : (
                        numberToCurrency(e.amount)
                     )}
                  </td>

                  <td>
                     {editingRow === e.rowIndex ? (
                        <input
                           type="date"
                           value={editedDate}
                           onChange={event => onChangeDate(event.target.value)}
                        />
                     ) : (
                        e.paymentDate
                     )}
                  </td>


                  <td>
                     {editingRow !== e.rowIndex && (
                        <>
                           <button onClick={() => onEdit(e)}>
                              Editar
                           </button>

                           <button onClick={() => onDelete(e.rowIndex)}>
                              Excluir
                           </button>
                        </>
                     )}

                     {editingRow === e.rowIndex && (
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