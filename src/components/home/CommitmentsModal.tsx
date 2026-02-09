import type { AlertItem } from "@/types/AlertItem"
import { useState, useEffect } from "react"

interface CommitmentsModalProps {
   isOpen: boolean
   onClose: () => void
   title: string
   items: AlertItem[]
   onSelect: (item: AlertItem) => void
}

/**
 * Bottom-sheet style modal that lists commitments for a specific period.
 * Primarily used to show details when an alert card is clicked.
 */
export function CommitmentsModal({
   isOpen,
   onClose,
   title,
   items,
   onSelect,
}: CommitmentsModalProps) {
   const [list, setList] = useState<AlertItem[]>([])

   /**
    * Syncs local state with props whenever the modal opens.
    */
   useEffect(() => {
      if (isOpen) {
         setList(items)
      }
   }, [isOpen, items])

   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-50">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
         />

         {/* Content Container (Bottom Sheet) */}
         <div className="
            absolute bottom-0 left-0 right-0
            rounded-t-2xl bg-white
            p-4 max-h-[80vh] overflow-y-auto
         ">
            <div className="mb-3 flex items-center justify-between">
               <h2 className="text-lg font-semibold">{title}</h2>
               <button onClick={onClose} className="text-sm text-muted-foreground">
                  Fechar
               </button>
            </div>

            <ul className="space-y-2">
               {list.map(item => (
                  <li
                     key={item.rowIndex}
                     className="rounded-lg border p-3 text-sm cursor-pointer hover:bg-muted"
                     onClick={() => onSelect(item)}
                  >
                     <div className="font-medium">{item.description}</div>
                     <div className="text-xs text-muted-foreground">
                        Vence em {item.dueDate}
                     </div>
                  </li>
               ))}

               {list.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-6">
                     Nenhum compromisso pendente 🎉
                  </div>
               )}
            </ul>
         </div>
      </div>
   )
}