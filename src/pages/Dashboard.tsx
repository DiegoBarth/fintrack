import { useNavigate } from 'react-router-dom'

import { CreditCards } from '@/components/dashboard/CreditCards'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { IncomeExpenseProgress } from '@/components/dashboard/IncomeExpenseProgress'
import { YearlyBalanceChart } from '@/components/dashboard/YearlyBalanceChart'
import { TopCategories } from '@/components/dashboard/TopCategories'
import { useDashboard } from '@/hooks/useDashboard'
import { usePeriod } from '@/contexts/PeriodContext'
import { Layout } from '@/components/layout/Layout'

export function Dashboard() {
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
               <IncomeExpenseProgress summary={summary} />
            </div>

            <div className="order-4 lg:order-none lg:row-span-2 lg:row-start-1 h-full">
               <TopCategories categories={dashboard.topCategories} />
            </div>

            <div className="order-2 lg:order-none lg:col-span-3 lg:row-start-3">
               <CreditCards cards={dashboard.cardsSummary} />
            </div>

            <div className="order-3 lg:order-none lg:col-span-2 lg:row-start-2 h-full">
               <YearlyBalanceChart data={dashboard.monthlyBalance} />
            </div>
         </div>
      </Layout>
   )
}