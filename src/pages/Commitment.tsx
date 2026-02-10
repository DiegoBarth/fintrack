import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { usePeriod } from '@/contexts/PeriodContext'
import { CommitmentList } from '@/components/commitments/CommitmentList'
import { AddCommitmentModal } from '@/components/commitments/AddCommitmentModal'
import { EditCommitmentModal } from '@/components/commitments/EditCommitmentModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Commitment } from '@/types/Commitment'
import { useCommitment } from '@/hooks/useCommitment'

/**
 * Main Page for managing commitments (bills, fixed costs, card installments).
 * Uses React Query for data fetching and state synchronization.
 */
export function Commitment() {
   const { month, year } = usePeriod()
   const { commitments, isLoading } = useCommitment(month, String(year))
   const navigate = useNavigate()

   const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null)
   const [isAddModalOpen, setIsAddModalOpen] = useState(false)

   if (isLoading) {
      return (
         <div className="mx-auto max-w-5xl p-4">
            <SkeletonList />
         </div>
      )
   }

   return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
         {/* Navigation & Header */}
         <div className="flex items-center justify-between mb-8">
            <button
               className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
               onClick={() => navigate('/')}
            >
               <ChevronLeft size={18} />
               Voltar
            </button>

            <button
               onClick={() => setIsAddModalOpen(true)}
               className="
                  flex items-center gap-2 rounded-full px-5 py-2.5 
                  text-white text-sm font-bold shadow-lg 
                  hover:scale-105 active:scale-95 transition-all
               "
               style={{ backgroundColor: 'rgb(245, 158, 11)' }} // Amber-500
            >
               <Plus size={18} />
               Novo Compromisso
            </button>
         </div>

         <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Compromissos</h1>
            <p className="text-sm text-muted-foreground">
               Gerencie suas contas fixas e parcelamentos.
            </p>
         </div>

         {/* Content Area */}
         {commitments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
               <p className="text-muted-foreground">Nenhum compromisso encontrado para este período.</p>
            </div>
         ) : (
            <CommitmentList
               commitments={commitments}
               onSelect={setSelectedCommitment}
            />
         )}

         {/* Modals */}
         <AddCommitmentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
         />

         <EditCommitmentModal
            isOpen={!!selectedCommitment}
            commitment={selectedCommitment}
            onClose={() => setSelectedCommitment(null)}
            onConfirm={() => { }}
         />
      </div>
   )
}