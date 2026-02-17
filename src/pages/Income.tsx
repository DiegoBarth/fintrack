import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IncomeList } from '@/components/incomes/IncomeList'
import { AddIncomeModal } from '@/components/incomes/AddIncomeModal'
import { EditIncomeModal } from '@/components/incomes/EditIncomeModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { Button } from '@/components/ui/Button'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Income } from '@/types/Income'
import { useIncome } from '@/hooks/useIncome'
import { Layout } from '@/components/layout/Layout'
import { Plus } from 'lucide-react'

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

   const headerSlot = (
      <Button size="sm" className="rounded-full shadow-sm" onClick={() => setModalOpen(true)}>
         <Plus className="size-4" />
         Nova receita
      </Button>
   )

   return (
      <Layout title="Receitas" onBack={handleBack} headerSlot={headerSlot}>
         <div className="pt-1">
            <IncomeList
               incomes={incomes}
               onSelect={setIncomeSelected}
            />
         </div>

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