import { useState, useCallback, lazy, Suspense } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useCommitment } from "@/hooks/useCommitment";
import { usePeriod } from "@/contexts/PeriodContext";
import { useToast } from "@/contexts/toast";
import { groupCommitmentsForAlerts } from "@/types/AlertItem";
import type { Commitment } from "@/types/Commitment";
import type { AlertItem } from "@/types/AlertItem";

const AlertsModal = lazy(() =>
  import("@/components/home/CommitmentsModal").then((m) => ({ default: m.AlertsModal }))
);
const EditCommitmentModal = lazy(() => import("@/components/commitments/EditCommitmentModal"));
const PayCardAlertModal = lazy(() =>
  import("@/components/home/PayCardAlertModal").then((m) => ({ default: m.PayCardAlertModal }))
);

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
   const { year } = usePeriod();
   const toast = useToast();
   const { overdue, today, week } = useAlerts();
   const { payCardStatement } = useCommitment("all", String(year));

   const [openType, setOpenType] = useState<"overdue" | "today" | "week" | null>(null);
   const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
   const [selectedCardGroup, setSelectedCardGroup] = useState<AlertItem | null>(null);
   const [removedIds, setRemovedIds] = useState<number[]>([]);
   const [originType, setOriginType] = useState<"overdue" | "today" | "week" | null>(null);
   const [isPayingCard, setIsPayingCard] = useState(false);

   const overdueFiltered = overdue.filter((c) => !removedIds.includes(c.rowIndex));
   const todayFiltered = today.filter((c) => !removedIds.includes(c.rowIndex));
   const weekFiltered = week.filter((c) => !removedIds.includes(c.rowIndex));

   const overdueDisplayItems = groupCommitmentsForAlerts(overdueFiltered);
   const todayDisplayItems = groupCommitmentsForAlerts(todayFiltered);
   const weekDisplayItems = groupCommitmentsForAlerts(weekFiltered);

   const hasAlerts =
      overdueDisplayItems.length > 0 ||
      todayDisplayItems.length > 0 ||
      weekDisplayItems.length > 0;

   function backToList() {
      if (originType === "overdue" && overdueDisplayItems.length > 0) setOpenType("overdue");
      if (originType === "today" && todayDisplayItems.length > 0) setOpenType("today");
      if (originType === "week" && weekDisplayItems.length > 0) setOpenType("week");
   }

   function markAsResolved(rowIndex: number) {
      setRemovedIds((prev) => [...prev, rowIndex]);
      setSelectedCommitment(null);
      setTimeout(backToList, 0);
   }

   function markCardGroupAsResolved(rowIndexes: number[]) {
      setRemovedIds((prev) => [...prev, ...rowIndexes]);
      setSelectedCardGroup(null);
      setTimeout(backToList, 0);
   }

   const handlePayCard = useCallback(async () => {
      if (!selectedCardGroup || selectedCardGroup.kind !== "cardGroup") return;
      setIsPayingCard(true);
      try {
         await payCardStatement({
            rowIndexes: selectedCardGroup.commitments.map((c) => c.rowIndex),
            paymentDate: new Date().toISOString().slice(0, 10),
         });
         markCardGroupAsResolved(selectedCardGroup.commitments.map((c) => c.rowIndex));
         toast.success("Fatura do cartão paga com sucesso!");
      } catch {
         // handleError já foi chamado pelo hook
      } finally {
         setIsPayingCard(false);
      }
   }, [selectedCardGroup, payCardStatement, toast]);

   const pluralize = (count: number, singular: string, plural: string) =>
      count === 1 ? singular : plural;

   if (!hasAlerts) return null;

   return (
      <>
         <div className="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] justify-center">
            {overdueDisplayItems.length > 0 && (
               <AlertCard
                  title={`${overdueDisplayItems.length} ${pluralize(overdueDisplayItems.length, "conta vencida", "contas vencidas")}`}
                  gradientFrom="#b91c1c"
                  gradientTo="#dc2626"
                  onClick={() => setOpenType("overdue")}
               />
            )}
            {todayDisplayItems.length > 0 && (
               <AlertCard
                  title={`${todayDisplayItems.length} ${pluralize(todayDisplayItems.length, "conta vencendo hoje", "contas vencendo hoje")}`}
                  gradientFrom="#ea580c"
                  gradientTo="#fb923c"
                  onClick={() => setOpenType("today")}
               />
            )}
            {weekDisplayItems.length > 0 && (
               <AlertCard
                  title={`${weekDisplayItems.length} ${pluralize(weekDisplayItems.length, "conta vencendo essa semana", "contas vencendo essa semana")}`}
                  gradientFrom="#0891b2"
                  gradientTo="#22d3ee"
                  onClick={() => setOpenType("week")}
               />
            )}
         </div>

         <Suspense fallback={null}>
            {openType && (
               <AlertsModal
                  isOpen={!!openType}
                  title={
                     openType === "overdue"
                        ? "Vencidos"
                        : openType === "today"
                          ? "Vencem hoje"
                          : "Vencem essa semana"
                  }
                  items={
                     openType === "overdue"
                        ? overdueDisplayItems
                        : openType === "today"
                          ? todayDisplayItems
                          : weekDisplayItems
                  }
                  onClose={() => setOpenType(null)}
                  onSelect={(item) => {
                     setOriginType(openType);
                     setOpenType(null);
                     if (item.kind === "cardGroup") {
                        setSelectedCardGroup(item);
                     } else {
                        setSelectedCommitment(item.commitment);
                     }
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

            {selectedCardGroup && selectedCardGroup.kind === "cardGroup" && (
               <PayCardAlertModal
                  isOpen={!!selectedCardGroup}
                  cardName={selectedCardGroup.card}
                  totalAmount={selectedCardGroup.totalAmount}
                  isPaying={isPayingCard}
                  onClose={() => {
                     setSelectedCardGroup(null);
                     backToList();
                  }}
                  onPay={handlePayCard}
               />
            )}
         </Suspense>
      </>
   );
}
