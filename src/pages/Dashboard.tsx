import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { useDashboard } from '@/hooks/useDashboard'
import { usePeriod } from '@/contexts/PeriodContext'
import { Layout } from '@/components/layout/Layout'

const CreditCards = lazy(() => import('@/components/dashboard/CreditCards'))
const IncomeExpenseProgress = lazy(() => import('@/components/dashboard/IncomeExpenseProgress'))
const YearlyBalanceChart = lazy(() => import('@/components/dashboard/YearlyBalanceChart'))
const TopCategories = lazy(() => import('@/components/dashboard/TopCategories'))

export default function Dashboard() {
  const { month, year, summary } = usePeriod();
  const { dashboard, isLoading } = useDashboard(month, String(year))

  const navigate = useNavigate()
  const handleBack = () => navigate('/')

  if (isLoading) {
    return (
      <Layout title="Dashboard" onBack={handleBack} containerClassName="max-w-7xl">
        <DashboardSkeleton />
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard" onBack={handleBack} containerClassName="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="order-1 lg:order-none lg:col-span-2 lg:row-start-1">
          <Suspense fallback={<DashboardSkeleton />}>
            <IncomeExpenseProgress summary={summary} />
          </Suspense>
        </div>

        <div className="order-4 lg:order-none lg:row-span-2 lg:row-start-1 h-full">
          <Suspense fallback={<DashboardSkeleton />}>
            <TopCategories categories={dashboard.topCategories} />
          </Suspense>
        </div>

        <div className="order-2 lg:order-none lg:col-span-3 lg:row-start-3">
          <Suspense fallback={<DashboardSkeleton />}>
            <CreditCards cards={dashboard.cardsSummary} />
          </Suspense>
        </div>

        <div className="order-3 lg:order-none lg:col-span-2 lg:row-start-2 h-full">
          <Suspense fallback={<DashboardSkeleton />}>
            <YearlyBalanceChart data={dashboard.monthlyBalance} />
          </Suspense>
        </div>
      </div>
    </Layout>
  )
}