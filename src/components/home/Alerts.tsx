import { useState } from "react"
import { useAlerts } from "@/contexts/UseAlerts"
import type { AlertItem } from "@/types/AlertItem"
import { CommitmentsModal } from "./CommitmentsModal"
import { EditCommitmentModal } from "./EditCommitmentModal"

interface AlertCardProps {
   title: string
   gradientFrom: string
   gradientTo: string
   onClick?: () => void
}

/**
 * Visual card representing a summary of alerts (Today or Week).
 */
function AlertCard({ title, gradientFrom, gradientTo, onClick }: AlertCardProps) {
   return (
      <button
         onClick={onClick}
         className="
            w-full text-left rounded-xl p-3 text-white
            flex items-center justify-between gap-2
            active:scale-[0.98] transition-transform shadow-sm
         "
         style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
         }}
      >
         <h3 className="text-sm font-medium text-white/90 truncate">
            {title}
         </h3>
         <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 whitespace-nowrap border border-white/20 rounded px-1.5">
            Ver detalhes
         </span>
      </button>
   )
}

/**
 * Alerts orchestrator. Manages the flow between the alert summary cards, 
 * the list of commitments, and the final payment/edit step.
 */
export function Alerts() {
   const { today, week } = useAlerts()

   // UI States
   const [openType, setOpenType] = useState<"today" | "week" | null>(null)
   const [selectedCommitment, setSelectedCommitment] = useState<AlertItem | null>(null)
   const [removedRows, setRemovedRows] = useState<number[]>([])
   const [originType, setOriginType] = useState<"today" | "week" | null>(null)

   /**
    * Navigates back to the list view after closing an editor or completing a task.
    */
   const returnToList = () => {
      if (originType === "today" && todayDueDates.length > 0) setOpenType("today")
      if (originType === "week" && weekDueDates.length > 0) setOpenType("week")
   }

   /**
    * Marks a commitment as resolved locally and refreshes the navigation.
    */
   const handleResolve = (rowIndex: number) => {
      setRemovedRows(prev => [...prev, rowIndex])
      setSelectedCommitment(null)
      // Small timeout to ensure state synchronization before modal re-opens
      setTimeout(() => returnToList(), 0)
   }

   // Data Mapping & Filtering
   const weekDueDates: AlertItem[] = week
      .filter(c => !removedRows.includes(c.rowIndex))
      .map(c => ({
         rowIndex: c.rowIndex,
         description: c.description,
         amount: c.amount,
         dueDate: c.dueDate,
      }))

   const todayDueDates: AlertItem[] = today
      .filter(c => !removedRows.includes(c.rowIndex))
      .map(c => ({
         rowIndex: c.rowIndex,
         description: c.description,
         amount: c.amount,
         dueDate: c.dueDate,
      }))

   if (!weekDueDates.length && !todayDueDates.length) return null

   return (
      <>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todayDueDates.length > 0 && (
               <AlertCard
                  title={`${todayDueDates.length} conta(s) vencendo hoje`}
                  gradientFrom="#db2777"
                  gradientTo="#f472b6"
                  onClick={() => setOpenType("today")}
               />
            )}

            {weekDueDates.length > 0 && (
               <AlertCard
                  title={`${weekDueDates.length} conta(s) vencendo esta semana`}
                  gradientFrom="#7c3aed"
                  gradientTo="#a855f7"
                  onClick={() => setOpenType("week")}
               />
            )}
         </div>

         {/* LIST MODALS */}
         <CommitmentsModal
            isOpen={openType === "today"}
            title="Vencem hoje"
            items={todayDueDates}
            onClose={() => setOpenType(null)}
            onSelect={item => {
               setOriginType("today")
               setOpenType(null)
               setSelectedCommitment(item)
            }}
         />

         <CommitmentsModal
            isOpen={openType === "week"}
            title="Vencem esta semana"
            items={weekDueDates}
            onClose={() => setOpenType(null)}
            onSelect={item => {
               setOriginType("week")
               setOpenType(null)
               setSelectedCommitment(item)
            }}
         />

         {/* EDITOR / PAYMENT MODAL */}
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