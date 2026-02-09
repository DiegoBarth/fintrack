import { useState } from "react"
import { useAlerts } from "@/contexts/UseAlerts"
import { CommitmentModal } from "./CommitmentsModal"
import { EditCommitmentModal } from "../commitments/EditCommitmentModal"
import type { Commitment } from "@/types/Commitment"
import { Bell, ChevronRight, Info } from "lucide-react"

interface AlertCardProps {
   title: string
   count: number
   gradientFrom: string
   gradientTo: string
   onClick?: () => void
}

/**
 * Visual card for a specific alert category.
 */
function AlertCard({ title, count, gradientFrom, gradientTo, onClick }: AlertCardProps) {
   return (
      <button
         onClick={onClick}
         className="
            relative overflow-hidden w-full text-left
            rounded-2xl p-4 text-white shadow-lg shadow-black/5
            flex items-center justify-between group
            active:scale-[0.98] transition-all duration-200
         "
         style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
         }}
      >
         <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
               <Bell size={18} className="text-white" />
            </div>
            <div>
               <h3 className="text-sm font-bold text-white leading-tight">
                  {count} {title}
               </h3>
               <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">
                  Ação necessária
               </p>
            </div>
         </div>

         <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md group-hover:bg-white/20 transition-colors">
            <span className="text-[10px] font-bold">DETALHES</span>
            <ChevronRight size={14} />
         </div>
      </button>
   )
}

export function Alerts() {
   const { today, week } = useAlerts()
   const [activeListType, setActiveListType] = useState<"today" | "week" | null>(null)
   const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null)
   const [resolvedIds, setResolvedIds] = useState<number[]>([])
   const [originType, setOriginType] = useState<"today" | "week" | null>(null)

   /**
    * Returns to the previous list modal after closing an edit modal.
    */
   function returnToList() {
      if (originType === "today" && dueToday.length > 0) setActiveListType("today")
      if (originType === "week" && dueThisWeek.length > 0) setActiveListType("week")
   }

   /**
    * Temporarily hides the item from the dashboard view upon resolution.
    */
   function handleResolve(rowIndex: number) {
      setResolvedIds(prev => [...prev, rowIndex])
      setSelectedCommitment(null)
      // Pequeno timeout para garantir que o estado da lista foi filtrado antes de reabrir
      setTimeout(() => returnToList(), 10)
   }

   // Filtering and Mapping logic
   const dueThisWeek: Commitment[] = week
      .filter(c => !resolvedIds.includes(c.rowIndex))
      .map(c => ({ ...c }))

   const dueToday: Commitment[] = today
      .filter(c => !resolvedIds.includes(c.rowIndex))
      .map(c => ({ ...c }))

   if (!dueThisWeek.length && !dueToday.length) {
      return (
         <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700">
            <Info size={18} />
            <span className="text-sm font-medium">Você está em dia! Nenhuma conta vencendo por agora.</span>
         </div>
      )
   }

   return (
      <>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dueToday.length > 0 && (
               <AlertCard
                  title="vencendo hoje"
                  count={dueToday.length}
                  gradientFrom="#e11d48" // Rose 600
                  gradientTo="#fb7185"   // Rose 400
                  onClick={() => setActiveListType("today")}
               />
            )}

            {dueThisWeek.length > 0 && (
               <AlertCard
                  title="vencendo esta semana"
                  count={dueThisWeek.length}
                  gradientFrom="#6d28d9" // Violet 700
                  gradientTo="#a855f7"   // Purple 500
                  onClick={() => setActiveListType("week")}
               />
            )}
         </div>

         {/* MODALS SECTION */}
         <CommitmentModal
            isOpen={activeListType === "today"}
            title="Vencem hoje"
            items={dueToday}
            onClose={() => setActiveListType(null)}
            onSelect={item => {
               setOriginType("today")
               setActiveListType(null)
               setSelectedCommitment(item)
            }}
         />

         <CommitmentModal
            isOpen={activeListType === "week"}
            title="Vencem esta semana"
            items={dueThisWeek}
            onClose={() => setActiveListType(null)}
            onSelect={item => {
               setOriginType("week")
               setActiveListType(null)
               setSelectedCommitment(item)
            }}
         />

         <EditCommitmentModal
            isOpen={!!selectedCommitment}
            commitment={selectedCommitment}
            onClose={() => {
               setSelectedCommitment(null)
               returnToList()
            }}
            onConfirm={handleResolve}
         />
      </>
   )
}