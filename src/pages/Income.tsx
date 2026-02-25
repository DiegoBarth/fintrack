import { useState, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { IncomeList } from '@/components/incomes/IncomeList'
import { IncomeSkeleton } from '@/components/incomes/IncomeSkeleton'
import { usePeriod } from '@/contexts/PeriodContext'
import { useIncome } from '@/hooks/useIncome'
import { Layout } from '@/components/layout/Layout'
import { numberToCurrency } from '@/utils/formatters'
import { format } from 'date-fns/format'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Plus } from 'lucide-react'
import type { Income } from '@/types/Income'

const AddIncomeModal = lazy(() => import('@/components/incomes/AddIncomeModal'))
const EditIncomeModal = lazy(() => import('@/components/incomes/EditIncomeModal'))

export default function Income() {
  const { month, year } = usePeriod()
  const { incomes, isLoading } = useIncome(month, String(year))
  const navigate = useNavigate()
  const handleBack = () => navigate('/')

  const [incomeSelected, setIncomeSelected] = useState<Income | null>(null)
  const [modalIsOpen, setModalOpen] = useState(false)

  const headerSubtitle = useMemo(() => {
    const raw =
      month === 'all'
        ? String(year)
        : format(new Date(Number(year), Number(month) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })
    const monthLabel = month === 'all' ? raw : raw.charAt(0).toUpperCase() + raw.slice(1)
    const total = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
    return `${monthLabel} • Total: ${numberToCurrency(total)}`
  }, [month, year, incomes])

  if (isLoading) {
    return (
      <Layout title="Receitas" onBack={handleBack} headerVariant="income">
        <IncomeSkeleton />
      </Layout>
    )
  }

  return (
    <Layout title="Receitas" onBack={handleBack} subtitle={headerSubtitle} headerVariant="income">
      <div className="pt-1 pb-20">
        <IncomeList
          incomes={incomes}
          onSelect={setIncomeSelected}
        />
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Nova receita"
      >
        <Plus className="h-7 w-7" />
      </button>

      {modalIsOpen && (
        <Suspense fallback={null}>
          <AddIncomeModal
            isOpen={modalIsOpen}
            onClose={() => setModalOpen(false)}
          />
        </Suspense>
      )}

      {incomeSelected && (
        <Suspense fallback={null}>
          <EditIncomeModal
            isOpen={!!incomeSelected}
            income={incomeSelected}
            onClose={() => setIncomeSelected(null)}
          />
        </Suspense>
      )}
    </Layout>
  )
}