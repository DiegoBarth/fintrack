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
console.log(dashboard)
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
         <div className="space-y-6">
            <IncomeExpenseProgress
               summary={summary}
            />

            <CreditCards
               cards={dashboard.cardsSummary}
            />

            <div className="grid gap-6 md:grid-cols-2">
               <YearlyBalanceChart
                  data={dashboard.monthlyBalance}
               />

               <TopCategories
                  categories={dashboard.topCategories}
               />
            </div>
         </div>
      </Layout>
   )
}