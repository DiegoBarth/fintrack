import type { Expense } from '../../types/Expense';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   expenses: Expense[];
   onDelete: (rowIndex: number) => void;
   editingRow: number | null;
   editedAmount: string;
   isPersisting: boolean;
   onEdit: (expense: Expense) => void;
   onCancelEdit: () => void;
   onSave: () => void;
   onChangeAmount: (amount: string) => void;
}

/**
 * Data grid for displaying and editing variable expenses.
 * Uses inline editing for the amount field.
 */
export function ExpenseGrid({
   expenses,
   onDelete,
   editingRow,
   editedAmount,
   isPersisting,
   onEdit,
   onCancelEdit,
   onSave,
   onChangeAmount
}: Props) {

   return (
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
         <thead>
            <tr style={{ background: '#f4f4f4' }}>
               <th style={{ padding: '8px' }}>Descrição</th>
               <th style={{ padding: '8px' }}>Categoria</th>
               <th style={{ padding: '8px' }}>Valor</th>
               <th style={{ padding: '8px' }}>Data</th>
               <th style={{ padding: '8px' }}>Ações</th>
            </tr>
         </thead>

         <tbody>
            {expenses.map(expense => (
               <tr key={expense.rowIndex} style={{ textAlign: 'center' }}>
                  <td style={{ padding: '8px' }}>{expense.description}</td>
                  <td style={{ padding: '8px' }}>{expense.category}</td>
                  <td style={{ padding: '8px' }}>
                     {editingRow === expense.rowIndex ? (
                        <input
                           type="text"
                           value={editedAmount}
                           onChange={e => onChangeAmount(formatCurrency(e.target.value))}
                           disabled={isPersisting}
                           autoFocus
                        />
                     ) : (
                        numberToCurrency(expense.amount)
                     )}
                  </td>

                  <td style={{ padding: '8px' }}>{expense.paymentDate}</td>

                  <td style={{ padding: '8px' }}>
                     {/* Default View Mode */}
                     {editingRow !== expense.rowIndex && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                           <button
                              onClick={() => onEdit(expense)}
                              disabled={isPersisting}
                           >
                              Editar
                           </button>

                           <button
                              onClick={() => onDelete(expense.rowIndex)}
                              disabled={isPersisting}
                              style={{ color: '#dc3545' }}
                           >
                              Excluir
                           </button>
                        </div>
                     )}

                     {/* Inline Edit Mode */}
                     {editingRow === expense.rowIndex && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                           <button
                              onClick={onSave}
                              disabled={isPersisting}
                              style={{ fontWeight: 'bold', color: '#28a745' }}
                           >
                              {isPersisting ? 'Salvando...' : 'Salvar'}
                           </button>

                           <button
                              onClick={onCancelEdit}
                              disabled={isPersisting}
                           >
                              Cancelar
                           </button>
                        </div>
                     )}
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
   );
}