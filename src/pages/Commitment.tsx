import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommitmentListGrouped } from '@/components/commitments/CommitmentListGrouped'
import { CommitmentTypeFilter, type CommitmentTypeFilterValue } from '@/components/commitments/CommitmentTypeFilter'
import { CommitmentCardFilter } from '@/components/commitments/CommitmentCardFilter'
import { CommitmentCardStatement } from '@/components/commitments/CommitmentCardStatement'
import EditCommitmentModal from '@/components/commitments/EditCommitmentModal'
import { AddCommitmentModal } from '@/components/commitments/AddCommitmentModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { Button } from '@/components/ui/Button';
import { usePeriod } from '@/contexts/PeriodContext';
import type { Commitment } from '@/types/Commitment';
import { useCommitment } from '@/hooks/useCommitment';
import { Layout } from '@/components/layout/Layout';
import { numberToCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';

export default function Commitment() {
   const { month, year } = usePeriod()
   const { commitments, isLoading, payCardStatement } = useCommitment(month, String(year))
   const [commitmentSelected, setCommitmentSelected] = useState<Commitment | null>(null)
   const [modalIsOpen, setModalOpen] = useState(false)
   const [typeFilter, setTypeFilter] = useState<CommitmentTypeFilterValue>(null)
   const [cardFilter, setCardFilter] = useState<string | null>(null)
   const [isPayingStatement, setIsPayingStatement] = useState(false)
   const navigate = useNavigate()

   const handleBack = () => navigate('/')

   const handleTypeChange = useCallback((type: CommitmentTypeFilterValue) => {
      setTypeFilter(type)
      if (type !== 'Cartão') setCardFilter(null)
   }, [])

   const filteredCommitments = useMemo(() => {
      let list = commitments
      if (typeFilter) {
         list = list.filter((c) => c.type === typeFilter)
      }
      if (typeFilter === 'Cartão' && cardFilter) {
         list = list.filter((c) => c.card === cardFilter)
      }
      return list
   }, [commitments, typeFilter, cardFilter])

   const unpaidFiltered = useMemo(
      () => filteredCommitments.filter((c) => !c.paymentDate),
      [filteredCommitments]
   )

   const totalStatement = useMemo(
      () => filteredCommitments.reduce((sum, c) => sum + Number(c.amount), 0),
      [filteredCommitments]
   )

   const statementAllPaid = unpaidFiltered.length === 0

   const headerSubtitle = useMemo(() => {
      const raw =
         month === 'all'
            ? String(year)
            : format(new Date(Number(year), Number(month) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })
      const monthLabel = month === 'all' ? raw : raw.charAt(0).toUpperCase() + raw.slice(1)
      const total = filteredCommitments.reduce((sum, c) => sum + Number(c.amount), 0)
      return `${monthLabel} • Total: ${numberToCurrency(total)}`
   }, [month, year, filteredCommitments])

   const handlePayStatement = useCallback(async () => {
      if (unpaidFiltered.length === 0) return
      const paymentDate = new Date().toISOString().slice(0, 10)
      setIsPayingStatement(true)
      try {
         await payCardStatement({
            rowIndexes: unpaidFiltered.map(c => c.rowIndex),
            paymentDate
         })
      } catch {
         // handleError já foi chamado pelo hook
      } finally {
         setIsPayingStatement(false)
      }
   }, [unpaidFiltered, payCardStatement])

   if (isLoading) {
      return (
         <Layout title="Compromissos" onBack={handleBack} headerVariant="commitment">
            <SkeletonList />
         </Layout>
      )
   }

   return (
      <Layout title="Compromissos" onBack={handleBack} subtitle={headerSubtitle} headerVariant="commitment">
         <div className="space-y-4 pb-20">
            <div className="space-y-3 pb-3 border-b border-border">
               <CommitmentTypeFilter
                  value={typeFilter}
                  onChange={handleTypeChange}
               />
               {typeFilter === 'Cartão' && (
                  <CommitmentCardFilter
                     value={cardFilter}
                     onChange={setCardFilter}
                  />
               )}
            </div>

            {typeFilter === 'Cartão' && cardFilter && (
               <CommitmentCardStatement
                  cardName={cardFilter}
                  totalStatement={totalStatement}
                  onPayStatement={handlePayStatement}
                  isPaying={isPayingStatement}
                  allPaid={statementAllPaid}
               />
            )}

            <CommitmentListGrouped
               commitments={filteredCommitments}
               onSelect={setCommitmentSelected}
               showStatementInGroupHeaders={!cardFilter}
            />
         </div>

         <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition-all hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Novo compromisso"
         >
            <Plus className="h-7 w-7" />
         </button>

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