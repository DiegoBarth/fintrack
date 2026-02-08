import type { Income } from '../../types/Income';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   incomes: Income[];
   onDelete: (rowIndex: number) => void;
   editingRow: number | null;
   editedValue: string;
   editedDate: string;
   isPersisting: boolean;
   onEdit: (income: Income) => void;
   onCancelEdit: () => void;
   onSave: () => void;
   onChangeValue: (value: string) => void;
   onChangeDate: (date: string) => void;
}

/**
 * Renders a data table for income records with inline editing capabilities.
 * All technical logic and props are in English, while UI labels remain in Portuguese.
 */
export function IncomeGrid({
   incomes,
   onDelete,
   editingRow,
   editedValue,
   editedDate,
   onEdit,
   onCancelEdit,
   onSave,
   onChangeValue,
   onChangeDate,
   isPersisting
}: Props) {

   return (
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
         <thead>
            <tr style={{ background: '#f4f4f4' }}>
               <th style={{ padding: '8px' }}>Descrição</th>
               <th style={{ padding: '8px' }}>Data prevista</th>
               <th style={{ padding: '8px' }}>Data recebimento</th>
               <th style={{ padding: '8px' }}>Valor</th>
               <th style={{ padding: '8px' }}>Ações</th>
            </tr>
         </thead>

         <tbody>
            {incomes.map(income => (
               <tr key={income.rowIndex} style={{ textAlign: 'center' }}>
                  <td style={{ padding: '8px' }}>{income.description}</td>
                  <td style={{ padding: '8px' }}>{income.expectedDate}</td>
                  <td style={{ padding: '8px' }}>
                     {editingRow === income.rowIndex ? (
                        <input
                           type="date"
                           value={editedDate}
                           onChange={e => onChangeDate(e.target.value)}
                           disabled={isPersisting}
                        />
                     ) : (
                        income.receivedDate
                     )}
                  </td>

                  <td style={{ padding: '8px' }}>
                     {editingRow === income.rowIndex ? (
                        <input
                           type="text"
                           value={editedValue}
                           onChange={e => onChangeValue(formatCurrency(e.target.value))}
                           disabled={isPersisting}
                           style={{ width: '100px' }}
                        />
                     ) : (
                        numberToCurrency(income.amount)
                     )}
                  </td>

                  <td style={{ padding: '8px' }}>
                     {/* View Mode Actions */}
                     {editingRow !== income.rowIndex && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                           <button
                              onClick={() => onEdit(income)}
                              disabled={isPersisting}
                           >
                              Editar
                           </button>

                           <button
                              onClick={() => onDelete(income.rowIndex)}
                              disabled={isPersisting}
                              style={{ color: '#dc3545' }}
                           >
                              Excluir
                           </button>
                        </div>
                     )}

                     {/* Edit Mode Actions */}
                     {editingRow === income.rowIndex && (
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