import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IncomeList } from '@/components/incomes/IncomeList'
import { AddIncomeModal } from '@/components/incomes/AddIncomeModal'
import { EditIncomeModal } from '@/components/incomes/EditIncomeModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Income } from '@/types/Income'
import { useIncome } from '@/hooks/useIncome'
import { Layout } from '@/components/layout/Layout'

export function Income() {
   const { month, year } = usePeriod()
   const { incomes, isLoading } = useIncome(month, String(year))
   const navigate = useNavigate()
   const handleBack = () => navigate('/')

   const [incomeSelected, setIncomeSelected] = useState<Income | null>(null)
   const [modalIsOpen, setModalOpen] = useState(false)

   if (isLoading) {
      return (
         <Layout title="Receitas" onBack={handleBack}>
            <SkeletonList />
         </Layout>
      )
   }

   return (
      <Layout title="Receitas" onBack={handleBack}>
         <div className="flex justify-end mb-4">
            <button
               onClick={() => setModalOpen(true)}
               className="rounded-full px-5 py-2 text-white font-medium shadow"
               style={{ backgroundColor: 'rgb(59, 130, 246)' }}
            >
               + Nova receita
            </button>
         </div>

         <IncomeList
            incomes={incomes}
            onSelect={setIncomeSelected}
         />

         <AddIncomeModal
            isOpen={modalIsOpen}
            onClose={() => setModalOpen(false)}
         />

         <EditIncomeModal
            isOpen={!!incomeSelected}
            income={incomeSelected}
            onClose={() => setIncomeSelected(null)}
         />
      </Layout>
   )
}