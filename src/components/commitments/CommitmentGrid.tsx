import type { Commitment } from '../../types/Commitment';
import { numberToCurrency, formatCurrency } from '../../utils/formatters';

interface Props {
   commitments: Commitment[];
   onDelete: (rowIndex: number, scope?: 'single' | 'future' | 'all') => void;
   editingRow: number | null;
   editedAmount: string;
   editedDate: string;
   isPersisting: boolean;
   onEdit: (commitment: Commitment) => void;
   onCancelEdit: () => void;
   onSave: (scope?: 'single' | 'future') => void;
   onChangeAmount: (amount: string) => void;
   onChangeDate: (date: string) => void;
}

/**
 * Renders a data grid for financial commitments.
 * Includes advanced logic for handling recurring/fixed items via 'scope' parameters.
 */
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
   onChangeDate,
   isPersisting
}: Props) {
   return (
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
         <thead>
            <tr style={{ background: '#f4f4f4' }}>
               <th style={{ padding: '8px' }}>Descrição</th>
               <th style={{ padding: '8px' }}>Categoria</th>
               <th style={{ padding: '8px' }}>Parcela</th>
               <th style={{ padding: '8px' }}>Valor</th>
               <th style={{ padding: '8px' }}>Vencimento</th>
               <th style={{ padding: '8px' }}>Pagamento</th>
               <th style={{ padding: '8px' }}>Pago</th>
               <th style={{ padding: '8px' }}>Ações</th>
            </tr>
         </thead>

         <tbody>
            {commitments.map(c => (
               <tr key={c.rowIndex} style={{ textAlign: 'center' }}>
                  <td style={{ padding: '8px' }}>{c.description}</td>
                  <td style={{ padding: '8px' }}>{c.category}</td>
                  <td style={{ padding: '8px' }}>
                     {c.installment ? `${c.installment}/${c.totalInstallments}` : '-'}
                  </td>

                  <td style={{ padding: '8px' }}>
                     {editingRow === c.rowIndex ? (
                        <input
                           type="text"
                           value={editedAmount}
                           onChange={e => onChangeAmount(formatCurrency(e.target.value))}
                           disabled={isPersisting}
                           style={{ width: '90px' }}
                        />
                     ) : (
                        numberToCurrency(c.amount)
                     )}
                  </td>

                  <td style={{ padding: '8px' }}>{c.dueDate}</td>

                  <td style={{ padding: '8px' }}>
                     {editingRow === c.rowIndex ? (
                        <input
                           type="date"
                           value={editedDate}
                           onChange={e => onChangeDate(e.target.value)}
                           disabled={isPersisting}
                        />
                     ) : (
                        c.paymentDate || '-'
                     )}
                  </td>

                  <td style={{ padding: '8px' }}>
                     <input type="checkbox" checked={c.paid} readOnly />
                  </td>

                  <td style={{ padding: '8px' }}>
                     {/* View Mode Actions */}
                     {editingRow !== c.rowIndex && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                           <button
                              onClick={() => onEdit(c)}
                              disabled={isPersisting}
                           >
                              Editar
                           </button>

                           <button
                              onClick={() => {
                                 let scope: 'single' | 'future' | 'all' = 'single';

                                 if (c.type === 'fixed') {
                                    const response = prompt(
                                       'Excluir apenas esta parcela (single), todas futuras (future) ou todas (all)?',
                                       'single'
                                    );
                                    if (!response || !['single', 'future', 'all'].includes(response)) return;
                                    scope = response as 'single' | 'future' | 'all';
                                 }
                                 onDelete(c.rowIndex, scope);
                              }}
                              disabled={isPersisting}
                              style={{ color: '#dc3545' }}
                           >
                              Excluir
                           </button>
                        </div>
                     )}

                     {/* Edit Mode Actions */}
                     {editingRow === c.rowIndex && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                           <button
                              onClick={() => {
                                 let scope: 'single' | 'future' = 'single';

                                 if (c.type === 'fixed') {
                                    const response = prompt(
                                       'Salvar apenas esta parcela (single) ou todas futuras (future)?',
                                       'single'
                                    );
                                    if (!response || !['single', 'future'].includes(response)) return;
                                    scope = response as 'single' | 'future';
                                 }

                                 onSave(scope);
                              }}
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