import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommitmentList } from '@/components/commitments/CommitmentList'
import { EditCommitmentModal } from '@/components/commitments/EditCommitmentModal'
import { AddCommitmentModal } from '@/components/commitments/AddCommitmentModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Commitment } from '@/types/Commitment'
import { useCommitment } from '@/hooks/useCommitment'
import { Layout } from '@/components/layout/Layout'

export function Commitment() {
   const { month, year } = usePeriod()
   const { commitments, isLoading } = useCommitment(month, String(year))
   const [commitmentSelected, setCommitmentSelected] = useState<Commitment | null>(null)
   const [modalIsOpen, setModalOpen] = useState(false)
   const navigate = useNavigate()

   const handleBack = () => navigate('/')

   if (isLoading) {
      return (
         <Layout title="Compromissos" onBack={handleBack}>
            <SkeletonList />
         </Layout>
      )
   }

   return (
      <Layout title="Compromissos" onBack={handleBack}>
         <div className="flex justify-end mb-4">
            <button
               onClick={() => setModalOpen(true)}
               className="rounded-full px-5 py-2 text-white font-medium shadow-md hover:brightness-90 transition"
               style={{ backgroundColor: 'rgb(245, 158, 11)' }}
            >
               + Novo Compromisso
            </button>
         </div>

         <CommitmentList
            commitments={commitments}
            onSelect={setCommitmentSelected}
         />

         <AddCommitmentModal
            isOpen={modalIsOpen}
            onClose={() => setModalOpen(false)}
         />

         <EditCommitmentModal
            isOpen={!!commitmentSelected}
            commitment={commitmentSelected}
            onClose={() => setCommitmentSelected(null)}
            onConfirm={() => { }}
         />
      </Layout>
   )
}