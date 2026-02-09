import { useAlerts } from "@/contexts/UseAlerts";
import type { Commitment } from "@/types/Commitment";
import { useState } from "react";
import { EditCommitmentModal } from "@/components/commitments/EditCommitmentModal";
import { CommitmentModal } from "@/components/home/CommitmentsModal";

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
        active:scale-[0.98] transition
      "
         style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
         }}
      >
         <h3 className="text-sm font-medium text-white/90 truncate">
            {title}
         </h3>

         <span className="text-xs opacity-80 whitespace-nowrap">
            Ver detalhes
         </span>
      </button>
   );
}

export function Alerts() {
   const { overdue, today, week } = useAlerts();
   const [openType, setOpenType] = useState<"overdue" | "today" | "week" | null>(null);
   const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
   const [removedIds, setRemovedIds] = useState<number[]>([]);
   const [originType, setOriginType] = useState<"overdue" | "today" | "week" | null>(null);

   function backToList() {
      if (originType === "overdue" && overdueList.length > 0) {
         setOpenType("overdue");
      }
      if (originType === "today" && todayList.length > 0) {
         setOpenType("today");
      }
      if (originType === "week" && weekList.length > 0) {
         setOpenType("week");
      }
   }

   function markAsResolved(rowIndex: number) {
      setRemovedIds(prev => [...prev, rowIndex]);
      setSelectedCommitment(null);

      setTimeout(() => {
         backToList();
      }, 0);
   }

   function pluralize(count: number, singular: string, plural: string) {
      return count === 1 ? singular : plural;
   }

   // Mapping and filtering data based on current state
   const overdueList: Commitment[] = overdue
      .filter(c => !removedIds.includes(c.rowIndex))
      .map(c => ({ ...c }));

   const todayList: Commitment[] = today
      .filter(c => !removedIds.includes(c.rowIndex))
      .map(c => ({ ...c }));

   const weekList: Commitment[] = week
      .filter(c => !removedIds.includes(c.rowIndex))
      .map(c => ({ ...c }));

   if (!overdueList.length && !weekList.length && !todayList.length) return null;

   return (
      <>
         <div className="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] justify-center">
            {overdueList.length > 0 && (
               <AlertCard
                  title={`${overdueList.length} ${pluralize(
                     overdueList.length,
                     'conta vencida',
                     'contas vencidas'
                  )}`}
                  gradientFrom="#dc2626"
                  gradientTo="#f87171"
                  onClick={() => setOpenType("overdue")}
               />
            )}

            {todayList.length > 0 && (
               <AlertCard
                  title={`${todayList.length} ${pluralize(
                     todayList.length,
                     'conta vencendo hoje',
                     'contas vencendo hoje'
                  )}`}
                  gradientFrom="#f59e0b"
                  gradientTo="#fbbf24"
                  onClick={() => setOpenType("today")}
               />
            )}

            {weekList.length > 0 && (
               <AlertCard
                  title={`${weekList.length} ${pluralize(
                     weekList.length,
                     'conta vencendo essa semana',
                     'contas vencendo essa semana'
                  )}`}
                  gradientFrom="#2563eb"
                  gradientTo="#60a5fa"
                  onClick={() => setOpenType("week")}
               />
            )}
         </div>

         {/* MODALS */}
         <CommitmentModal
            isOpen={openType === "overdue"}
            title="Contas Vencidas"
            items={overdueList}
            onClose={() => setOpenType(null)}
            onSelect={item => {
               setOriginType(openType);
               setOpenType(null);
               setSelectedCommitment(item);
            }}
         />

         <CommitmentModal
            isOpen={openType === "today"}
            title="Vencem hoje"
            items={todayList}
            onClose={() => setOpenType(null)}
            onSelect={item => {
               setOriginType(openType);
               setOpenType(null);
               setSelectedCommitment(item);
            }}
         />

         <CommitmentModal
            isOpen={openType === "week"}
            title="Vencem essa semana"
            items={weekList}
            onClose={() => setOpenType(null)}
            onSelect={item => {
               setOriginType(openType);
               setOpenType(null);
               setSelectedCommitment(item);
            }}
         />

         <EditCommitmentModal
            isOpen={!!selectedCommitment}
            commitment={selectedCommitment}
            onClose={() => {
               setSelectedCommitment(null);
               backToList();
            }}
            onConfirm={markAsResolved}
         />
      </>
   );
}