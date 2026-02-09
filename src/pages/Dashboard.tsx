import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/contexts/DashboardContext'

import { YearlyBalanceChart } from '@/components/dashboard/YearlyBalanceChart'
import { TopCategories } from '@/components/dashboard/TopCategories'
import { CreditCards } from '@/components/dashboard/CreditCards'
import { IncomeExpenseProgress } from '@/components/dashboard/IncomeExpenseProgress'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export function Dashboard() {
   const {
      yearlyBalance,
      topCategories,
      cards,
      summary,
      loading,
   } = useDashboard()

   const navigate = useNavigate()

   if (loading) {
      return (
         <div className="mx-auto max-w-5xl p-4">
            <DashboardSkeleton />
         </div>
      )
   }

   return (
      <div className="mx-auto max-w-7xl space-y-6 p-4">
         <button
            className="mb-4 px-3 py-1 rounded-md border hover:bg-gray-100 transition"
            onClick={() => navigate('/')}
         >
            ← Voltar
         </button>

         <h1 className="text-xl font-semibold">Dashboard</h1>

         {/* Progress is priority */}
         <IncomeExpenseProgress
            summary={summary}
         />

         {/* Credit cards at the bottom */}
         <CreditCards
            cards={cards}
         />

         {/* Main Grid */}
         <div className="grid gap-6 md:grid-cols-2">
            <YearlyBalanceChart
               data={yearlyBalance}
            />

            <TopCategories
               categories={topCategories}
            />
         </div>

      </div>
   )
}