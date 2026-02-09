import { useState, useEffect } from 'react'
import { X, Calendar, CheckCircle } from 'lucide-react'
import type { Commitment } from '@/types/Commitment'

interface CommitmentModalProps {
   isOpen: boolean
   onClose: () => void
   title: string
   items: Commitment[]
   onSelect: (item: Commitment) => void
}

/**
 * A specialized modal to list multiple commitments, 
 * typically used for "Pending Tasks" or "Upcoming Bills" views.
 */
export function CommitmentModal({
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
         {/* Overlay com Blur para foco total */}
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
         />

         {/* Modal Container */}
         <div className="
            relative w-full md:w-[450px] max-h-[85vh]
            bg-white rounded-t-3xl md:rounded-2xl
            shadow-2xl flex flex-col overflow-hidden
            animate-in slide-in-from-bottom-10 duration-300
         ">
            {/* Header com Handle Bar para Mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between p-5 border-b">
               <div>
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
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
            <div className="overflow-y-auto p-4 md:max-h-[400px]">
               {list.length > 0 ? (
                  <ul className="space-y-3">
                     {list.map(item => (
                        <li
                           key={item.rowIndex}
                           className="
                              group flex items-center justify-between
                              rounded-xl border border-gray-100 p-4 
                              bg-white hover:border-primary/30 hover:shadow-md 
                              cursor-pointer transition-all duration-200
                           "
                           onClick={() => onSelect(item)}
                        >
                           <div className="flex-1 min-w-0">
                              <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                 {item.description}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                 <Calendar size={12} className="shrink-0" />
                                 <span>Vence em {item.dueDate}</span>
                              </div>
                           </div>

                           <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-orange-600">
                                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
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
                     <p className="text-sm text-muted-foreground mt-1">
                        Você não tem compromissos pendentes para este filtro. 🎉
                     </p>
                  </div>
               )}
            </div>

            {/* Footer de ações (opcional) */}
            <div className="p-4 bg-muted/30 border-t mt-auto">
               <button
                  onClick={onClose}
                  className="w-full py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
               >
                  Fechar
               </button>
            </div>
         </div>
      </div>
   )
}