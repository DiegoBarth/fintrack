import { useEffect, useState, useRef, lazy, Suspense } from 'react'

import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { usePeriod } from '@/contexts/PeriodContext'
import { Layout } from '@/components/layout/Layout'

const CreditCards = lazy(() => import('@/components/dashboard/CreditCards'))
const IncomeExpenseProgress = lazy(() => import('@/components/dashboard/IncomeExpenseProgress'))
const YearlyBalanceChart = lazy(() => import('@/components/dashboard/YearlyBalanceChart'))
const TopCategories = lazy(() => import('@/components/dashboard/TopCategories'))

import { IncomeExpenseSkeleton } from '@/components/dashboard/skeletons/IncomeExpenseSkeleton'
import { TopCategoriesSkeleton } from '@/components/dashboard/skeletons/TopCategoriesSkeleton'
import { CreditCardsSkeleton } from '@/components/dashboard/skeletons/CreditCardsSkeleton'
import { YearlyBalanceSkeleton } from '@/components/dashboard/skeletons/YearlyBalanceSkeleton'

export default function Dashboard() {
  const { month, year, summary } = usePeriod();
  const { dashboard, isLoading } = useDashboard(month, String(year))

  const chartRef = useRef<HTMLDivElement | null>(null)
  const [chartVisible, setChartVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (chartRef.current) observer.observe(chartRef.current)

    return () => observer.disconnect()
  }, [])

  const navigate = useNavigate()
  const handleBack = () => navigate('/')

  return (
    <Layout title="Dashboard" onBack={handleBack} headerVariant="dashboard" containerClassName="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <IncomeExpenseSkeleton />
          ) : (
            <Suspense fallback={<IncomeExpenseSkeleton />}>
              <IncomeExpenseProgress summary={summary} />
            </Suspense>
          )}

        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <CreditCardsSkeleton />
          ) : (
            <Suspense fallback={<CreditCardsSkeleton />}>
              <CreditCards cards={dashboard.cardsSummary} />
            </Suspense>
          )}
        </div>

        <div className="lg:row-span-2">
          {isLoading ? (
            <TopCategoriesSkeleton />
          ) : (
            <Suspense fallback={<TopCategoriesSkeleton />}>
              <TopCategories categories={dashboard.topCategories} />
            </Suspense>
          )}
        </div>

        <div ref={chartRef} className="lg:col-span-2">
          {isLoading || !chartVisible ? (
            <YearlyBalanceSkeleton />
          ) : (
            <Suspense fallback={<YearlyBalanceSkeleton />}>
              <YearlyBalanceChart data={dashboard.monthlyBalance} />
            </Suspense>
          )}
        </div>
      </div>
    </Layout>
  );
}