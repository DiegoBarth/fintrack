import { useState, lazy, Suspense } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import type { Commitment } from "@/types/Commitment";

const CommitmentModal = lazy(() => import("@/components/home/CommitmentsModal"))
const EditCommitmentModal = lazy(() => import("@/components/commitments/EditCommitmentModal"))

interface AlertCardProps {
   title: string;
   gradientFrom: string;
   gradientTo: string;
   onClick?: () => void;
}

function AlertCard({ title, gradientFrom, gradientTo, onClick }: AlertCardProps) {
   return (
      <button
         onClick={onClick}
         className="
            w-full text-left
            rounded-xl p-2 text-white
            flex items-center justify-between
            gap-2
            active:scale-[0.98] 
            hover:scale-105 
            hover:shadow-lg
            transition-all 
            duration-200
            group"
         style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
         }}
      >
         <h3 className="text-sm font-medium text-white/90 truncate group-hover:text-white">
            {title}
         </h3>

         <span className="text-xs opacity-80 whitespace-nowrap group-hover:opacity-100 group-hover:font-medium transition-all">
            Ver detalhes
         </span>
      </button>
   );
}

export default function Alerts() {
   const { overdue, today, week } = useAlerts();
   const [openType, setOpenType] = useState<"overdue" | "today" | "week" | null>(null);
   const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
   const [removedIds, setRemovedIds] = useState<number[]>([]);
   const [originType, setOriginType] = useState<"overdue" | "today" | "week" | null>(null);

   function backToList() {
      if (originType === "overdue" && overdueList.length > 0) setOpenType("overdue");
      if (originType === "today" && todayList.length > 0) setOpenType("today");
      if (originType === "week" && weekList.length > 0) setOpenType("week");
   }

   function markAsResolved(rowIndex: number) {
      setRemovedIds(prev => [...prev, rowIndex]);
      setSelectedCommitment(null);
      setTimeout(backToList, 0);
   }

   const pluralize = (count: number, singular: string, plural: string) =>
      count === 1 ? singular : plural;

   const overdueList: Commitment[] = overdue.filter(c => !removedIds.includes(c.rowIndex));
   const todayList: Commitment[] = today.filter(c => !removedIds.includes(c.rowIndex));
   const weekList: Commitment[] = week.filter(c => !removedIds.includes(c.rowIndex));

   if (!overdueList.length && !todayList.length && !weekList.length) return null;

   return (
      <>
         <div className="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] justify-center">
            {overdueList.length > 0 && (
               <AlertCard
                  title={`${overdueList.length} ${pluralize(overdueList.length, 'conta vencida', 'contas vencidas')}`}
                  gradientFrom="#b91c1c"
                  gradientTo="#dc2626"
                  onClick={() => setOpenType("overdue")}
               />
            )}
            {todayList.length > 0 && (
               <AlertCard
                  title={`${todayList.length} ${pluralize(todayList.length, 'conta vencendo hoje', 'contas vencendo hoje')}`}
                  gradientFrom="#ea580c"
                  gradientTo="#fb923c"
                  onClick={() => setOpenType("today")}
               />
            )}
            {weekList.length > 0 && (
               <AlertCard
                  title={`${weekList.length} ${pluralize(weekList.length, 'conta vencendo essa semana', 'contas vencendo essa semana')}`}
                  gradientFrom="#0891b2"
                  gradientTo="#22d3ee"
                  onClick={() => setOpenType("week")}
               />
            )}
         </div>

         <Suspense fallback={null}>
            {openType && (
               <CommitmentModal
                  isOpen={!!openType}
                  title={openType === "overdue" ? "Vencidos" : openType === "today" ? "Vencem hoje" : "Vencem essa semana"}
                  items={openType === "overdue" ? overdueList : openType === "today" ? todayList : weekList}
                  onClose={() => setOpenType(null)}
                  onSelect={item => {
                     setOriginType(openType);
                     setOpenType(null);
                     setSelectedCommitment(item);
                  }}
               />
            )}

            {selectedCommitment && (
               <EditCommitmentModal
                  isOpen={!!selectedCommitment}
                  commitment={selectedCommitment}
                  onClose={() => {
                     setSelectedCommitment(null);
                     backToList();
                  }}
                  onConfirm={markAsResolved}
               />
            )}
         </Suspense>
      </>
   );
}
