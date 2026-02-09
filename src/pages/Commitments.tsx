import { useEffect, useState } from 'react'
import { listCommitments } from '@/api/endpoints/commitments'
import type { Commitment } from '@/types/Commitment'
import { CommitmentList } from '@/components/commitments/CommitmentList'
import { AddCommitmentModal } from '@/components/commitments/AddCommitmentModal'
import { EditCommitmentModal } from '@/components/commitments/EditCommitmentModal'
import { usePeriod } from '@/contexts/PeriodContext'
import { useNavigate } from 'react-router-dom'
import { commitmentsCache } from '@/cache/CommitmentsCache'
import { ChevronLeft, Plus } from 'lucide-react'
import { SkeletonList } from '@/components/ui/SkeletonList'

/**
 * Main Page for managing commitments (bills, fixed costs, card installments).
 * Orchestrates the list fetching and modal states.
 */
export function Commitments() {
   const { month, year } = usePeriod()
   const navigate = useNavigate()

   const [commitments, setCommitments] = useState<Commitment[]>([])
   const [isLoading, setIsLoading] = useState(false)
   const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null)
   const [isAddModalOpen, setIsAddModalOpen] = useState(false)

   /**
    * Fetches data from API and updates local state.
    */
   async function fetchData() {
      setIsLoading(true)
      try {
         const data = await listCommitments(month, String(year))
         setCommitments(data)
      } catch (error) {
         console.error("Failed to fetch commitments:", error)
      } finally {
         setIsLoading(false)
      }
   }

   /**
    * Syncs local state with cache after mutations (Create/Update/Delete).
    */
   function syncWithCache() {
      const updatedData = commitmentsCache.get(month, year) || []
      setCommitments([...updatedData])
   }

   useEffect(() => {
      fetchData()
   }, [month, year])

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
         {isLoading ? (
            <div className="flex flex-col gap-3">
               {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 w-full animate-pulse bg-muted rounded-xl" />
               ))}
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
            onSave={syncWithCache}
         />

         <EditCommitmentModal
            isOpen={!!selectedCommitment}
            commitment={selectedCommitment}
            onClose={() => setSelectedCommitment(null)}
            onConfirm={syncWithCache}
         />
      </div>
   )
}