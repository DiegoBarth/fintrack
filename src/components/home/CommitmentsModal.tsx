import { useState, useEffect } from "react"
import type { AlertItem } from "@/types/AlertItem"

interface CommitmentsModalProps {
   isOpen: boolean
   onClose: () => void
   title: string
   items: AlertItem[]
   onSelect: (item: AlertItem) => void
}

/**
 * A selection modal that displays a list of pending commitments.
 * Users can click an item to trigger a secondary action (like payment/editing).
 */
export function CommitmentsModal({
   isOpen,
   onClose,
   title,
   items,
   onSelect,
}: CommitmentsModalProps) {
   const [list, setList] = useState<AlertItem[]>([])

   // Synchronize internal list state when modal opens
   useEffect(() => {
      if (isOpen) {
         setList(items)
      }
   }, [isOpen, items])

   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center">
         {/* Overlay / Backdrop */}
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
         />

         {/* Modal Container */}
         <div className="
            relative w-full md:w-[420px] max-h-[85vh]
            bg-white rounded-t-2xl md:rounded-2xl
            flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-200
         ">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
               <div>
                  <h2 className="text-lg font-bold text-foreground">{title}</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                     {list.length} {list.length === 1 ? 'pendência' : 'pendências'}
                  </p>
               </div>
               <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors"
               >
                  Fechar
               </button>
            </div>

            {/* Scrollable List Content */}
            <ul className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar">
               {list.length > 0 ? (
                  list.map(item => (
                     <li
                        key={item.rowIndex}
                        className="
                           group relative flex flex-col gap-1
                           rounded-xl border border-gray-100 bg-gray-50/50 p-4 
                           cursor-pointer hover:bg-white hover:border-primary/30 
                           hover:shadow-md transition-all active:scale-[0.98]
                        "
                        onClick={() => onSelect(item)}
                     >
                        <div className="flex justify-between items-start">
                           <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {item.description}
                           </span>
                           <span className="text-xs font-bold text-foreground bg-white px-2 py-1 rounded-md border shadow-sm">
                              Vence {item.dueDate}
                           </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Clique para confirmar o pagamento deste compromisso.
                        </p>
                     </li>
                  ))
               ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                     <span className="text-4xl mb-2">🎉</span>
                     <p className="text-sm font-medium text-muted-foreground">
                        Nenhum compromisso pendente.
                     </p>
                  </div>
               )}
            </ul>
         </div>
      </div>
   )
}