import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommitmentListGrouped } from '@/components/commitments/CommitmentListGrouped'
import { CommitmentTypeFilter, type CommitmentTypeFilterValue } from '@/components/commitments/CommitmentTypeFilter'
import { CommitmentCardFilter } from '@/components/commitments/CommitmentCardFilter'
import { CommitmentCardStatement } from '@/components/commitments/CommitmentCardStatement'
import { CommitmentSkeleton } from '@/components/commitments/CommitmentSkeleton'
import { usePeriod } from '@/contexts/PeriodContext';
import { useCommitment } from '@/hooks/useCommitment';
import { Layout } from '@/components/layout/Layout';
import { numberToCurrency } from '@/utils/formatters';
import { format } from 'date-fns/format';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Plus, Wallet, AlertCircle } from 'lucide-react';
import type { Commitment } from '@/types/Commitment';

const AddCommitmentModal = lazy(() => import('@/components/commitments/AddCommitmentModal'))
const EditCommitmentModal = lazy(() => import('@/components/commitments/EditCommitmentModal'))

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

  const { totalAmount, pendingAmount } = useMemo(() => {
    return filteredCommitments.reduce(
      (acc, c) => {
        const amountNum = Number(c.amount) || 0;
        acc.totalAmount += amountNum;
        if (!c.paymentDate) {
          acc.pendingAmount += amountNum;
        }
        return acc;
      },
      { totalAmount: 0, pendingAmount: 0 }
    );
  }, [filteredCommitments]);

  const totalStatement = useMemo(
    () => filteredCommitments.reduce((sum, c) => sum + Number(c.amount), 0),
    [filteredCommitments]
  )

  const statementAllPaid = unpaidFiltered.length === 0

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
    } finally {
      setIsPayingStatement(false)
    }
  }, [unpaidFiltered, payCardStatement])

  if (isLoading) {
    return (
      <Layout title="Compromissos" onBack={handleBack} showPeriodoFilters headerVariant="commitment">
        <CommitmentSkeleton />
      </Layout>
    )
  }

  return (
    <Layout title="Compromissos" onBack={handleBack} showPeriodoFilters headerVariant="commitment">
      <div className="space-y-4 pb-20">

        <div className="grid grid-cols-2 gap-3 bit-cards-wrapper">
          <div className="flex flex-col justify-between p-3.5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between gap-2 text-muted-foreground mb-1">
              <span className="text-xs font-medium tracking-tight">Total Geral</span>
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold tracking-tight text-foreground truncate">
              {numberToCurrency(totalAmount)}
            </p>
          </div>

          <div className="flex flex-col justify-between p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <span className="text-xs font-medium tracking-tight">A Pagar</span>
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold tracking-tight text-amber-700 dark:text-amber-400 truncate">
              {numberToCurrency(pendingAmount)}
            </p>
          </div>
        </div>

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

      {modalIsOpen && (
        <Suspense fallback={null}>
          <AddCommitmentModal
            isOpen={modalIsOpen}
            onClose={() => setModalOpen(false)}
          />
        </Suspense>
      )}

      {commitmentSelected && (
        <Suspense fallback={null}>
          <EditCommitmentModal
            isOpen={!!commitmentSelected}
            commitment={commitmentSelected}
            onClose={() => setCommitmentSelected(null)}
            onConfirm={() => { }}
          />
        </Suspense>
      )}
    </Layout>
  )
}