import { useState, useEffect } from 'react'
import { X, Calendar, CheckCircle, Wallet } from 'lucide-react'
import type { Commitment } from '@/types/Commitment'
import type { AlertItem } from '@/types/AlertItem'
import { numberToCurrency } from '@/utils/formatters'

interface CommitmentModalProps {
   isOpen: boolean
   onClose: () => void
   title: string
   items: Commitment[]
   onSelect: (item: Commitment) => void
}

interface AlertsModalProps {
   isOpen: boolean
   onClose: () => void
   title: string
   items: AlertItem[]
   onSelect: (item: AlertItem) => void
}

/**
 * Modal for alerts - groups card commitments by card, shows individual commitments separately.
 */
export function AlertsModal({
   isOpen,
   onClose,
   title,
   items,
   onSelect,
}: AlertsModalProps) {
   const [list, setList] = useState<AlertItem[]>([])

   useEffect(() => {
      if (isOpen) {
         setList(items)
      }
   }, [isOpen, items])

   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-[60] flex justify-center items-end md:items-center p-0 md:p-4">
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
         />

         <div className="
            relative w-full md:w-[450px] max-h-[85vh]
            bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl
            shadow-2xl flex flex-col overflow-hidden
            animate-in slide-in-from-bottom-10 duration-300
         ">
            <div className="md:hidden flex justify-center pt-3 pb-1">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between p-5 border-b">
               <div>
                  <h2 className="text-lg font-semibold dark:text-gray-100">{title}</h2>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                     {list.length} {list.length === 1 ? 'item pendente' : 'itens pendentes'}
                  </p>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
               >
                  <X size={20} />
               </button>
            </div>

            <div className="overflow-y-auto p-4 md:max-h-[400px] ">
               {list.length > 0 ? (
                  <ul className="space-y-3 ">
                     {list.map((item) =>
                        item.kind === 'cardGroup' ? (
                           <li
                              key={`card-${item.card}`}
                              className="
                                 group flex items-center justify-between
                                 rounded-xl border p-4 
                                 bg-white dark:bg-gray-900
                                 border-gray-100 dark:border-gray-700
                                 hover:border-primary/30 dark:hover:border-primary/40
                                 hover:shadow-md 
                                 cursor-pointer transition-all duration-200"
                              onClick={() => onSelect(item)}
                           >
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                    <Wallet size={16} />
                                 </div>
                                 <div>
                                    <div className="font-medium dark:text-gray-100">
                                       Cartão {item.card}
                                    </div>
                                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                                       {item.commitments.length} {item.commitments.length === 1 ? 'compromisso' : 'compromissos'} • Toque para pagar fatura
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                 <span className="font-bold text-orange-600">
                                    {numberToCurrency(item.totalAmount)}
                                 </span>
                                 <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">
                                    Pendente
                                 </span>
                              </div>
                           </li>
                        ) : (
                           <li
                              key={item.commitment.rowIndex}
                              className="
                                 group flex items-center justify-between
                                 rounded-xl border p-4 
                                 bg-white dark:bg-gray-900
                                 border-gray-100 dark:border-gray-700
                                 hover:border-primary/30 dark:hover:border-primary/40
                                 hover:shadow-md 
                                 cursor-pointer transition-all duration-200"
                              onClick={() => onSelect(item)}
                           >
                              <div className="flex-1 min-w-0 ">
                                 <div className="font-medium dark:text-gray-100">{item.commitment.description}</div>
                                 <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
                                    <Calendar size={12} className="shrink-0" />
                                    <span>Vence em {item.commitment.dueDate}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                 <span className="font-bold text-orange-600">
                                    {numberToCurrency(item.commitment.amount)}
                                 </span>
                                 <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">
                                    Pendente
                                 </span>
                              </div>
                           </li>
                        )
                     )}
                  </ul>
               ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                     <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                        <CheckCircle size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-foreground">Tudo em dia!</h3>
                     <div className="text-center text-sm text-muted-foreground dark:text-gray-400 py-6">
                        Você não tem compromissos pendentes para este filtro. 🎉
                     </div>
                  </div>
               )}
            </div>

            <div className="p-4 bg-muted/30 border-t mt-auto">
               <button
                  onClick={onClose}
                  className="
                     w-full py-3 
                     bg-white dark:bg-gray-900
                     border border-gray-200 dark:border-gray-700
                     rounded-xl font-bold text-sm
                     hover:bg-gray-50 dark:hover:bg-gray-800
                     transition-colors shadow-sm"
               >
                  Fechar
               </button>
            </div>
         </div>
      </div>
   )
}

/**
 * A specialized modal to list multiple commitments, 
 * typically used for "Pending Tasks" or "Upcoming Bills" views.
 */
export default function CommitmentModal({
   isOpen,
   onClose,
   title,
   items,
   onSelect,
}: CommitmentModalProps) {
   const [list, setList] = useState<Commitment[]>([])

   useEffect(() => {
      if (isOpen) {
         setList(items)
      }
   }, [isOpen, items])

   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-[60] flex justify-center items-end md:items-center p-0 md:p-4">
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
         />

         {/* Modal Container */}
         <div className="
            relative w-full md:w-[450px] max-h-[85vh]
            bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl
            shadow-2xl flex flex-col overflow-hidden
            animate-in slide-in-from-bottom-10 duration-300
         ">
            <div className="md:hidden flex justify-center pt-3 pb-1">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between p-5 border-b">
               <div>
                  <h2 className="text-lg font-semibold dark:text-gray-100">{title}</h2>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                     {list.length} {list.length === 1 ? 'item pendente' : 'itens pendentes'}
                  </p>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 md:max-h-[400px] ">
               {list.length > 0 ? (
                  <ul className="space-y-3 ">
                     {list.map(item => (
                        <li
                           key={item.rowIndex}
                           className="
                              group flex items-center justify-between
                              rounded-xl border p-4 
                              bg-white dark:bg-gray-900
                              border-gray-100 dark:border-gray-700
                              hover:border-primary/30 dark:hover:border-primary/40
                              hover:shadow-md 
                              cursor-pointer transition-all duration-200"
                           onClick={() => onSelect(item)}
                        >

                           <div className="flex-1 min-w-0 ">
                              <div className="font-medium dark:text-gray-100">{item.description}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
                                 <Calendar size={12} className="shrink-0" />
                                 <span>Vence em {item.dueDate}</span>
                              </div>
                           </div>

                           <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-orange-600">
                                 {numberToCurrency(item.amount)}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">
                                 Pendente
                              </span>
                           </div>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                     <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                        <CheckCircle size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-foreground">Tudo em dia!</h3>
                     <div className="text-center text-sm text-muted-foreground dark:text-gray-400 py-6">
                        Você não tem compromissos pendentes para este filtro. 🎉
                     </div>
                  </div>
               )}
            </div>

            <div className="p-4 bg-muted/30 border-t mt-auto">
               <button
                  onClick={onClose}
                  className="
                     w-full py-3 
                     bg-white dark:bg-gray-900
                     border border-gray-200 dark:border-gray-700
                     rounded-xl font-bold text-sm
                     hover:bg-gray-50 dark:hover:bg-gray-800
                     transition-colors shadow-sm"
               >
                  Fechar
               </button>
            </div>
         </div>
      </div>
   )
}