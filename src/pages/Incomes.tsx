import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { usePeriod } from '@/contexts/PeriodContext'
import { IncomeList } from '@/components/incomes/IncomeList'
import { AddIncomeModal } from '@/components/incomes/AddIncomeModal'
import { EditIncomeModal } from '@/components/incomes/EditIncomeModal'
import { Button } from '@/components/ui/Button'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Income } from '@/types/Income'
import { useIncomes } from '@/hooks/useIncome'

/**
 * Main page for Income management.
 * Leverages TanStack Query for efficient data fetching and global cache synchronization.
 */
export function Incomes() {
   const { month, year } = usePeriod()
   const { incomes, isLoading } = useIncomes(month, String(year))
   const navigate = useNavigate()

   const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
   const [isAddModalOpen, setIsAddModalOpen] = useState(false)

   if (isLoading) {
      return (
         <div className="mx-auto max-w-5xl p-4">
            <SkeletonList />
         </div>
      )
   }

   return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
         {/* Navigation & Actions */}
         <div className="flex items-center justify-between">
            <button
               onClick={() => navigate('/')}
               className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition font-medium"
            >
               <ChevronLeft className="h-4 w-4" />
               Voltar
            </button>

            <Button
               onClick={() => setIsAddModalOpen(true)}
               className="rounded-full shadow-lg gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
               <Plus className="h-4 w-4" />
               Nova receita
            </Button>
         </div>

         {/* Page Header */}
         <header>
            <h1 className="text-2xl font-bold tracking-tight">Receitas</h1>
            <p className="text-sm text-muted-foreground">
               Gerencie suas entradas para o período de {month}/{year}
            </p>
         </header>

         {/* Content Area */}
         <main className="min-h-[400px]">
            <IncomeList
               incomes={incomes}
               onSelect={setSelectedIncome}
            />
         </main>

         {/* Modals */}
         <AddIncomeModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
         />

         <EditIncomeModal
            isOpen={!!selectedIncome}
            income={selectedIncome}
            onClose={() => setSelectedIncome(null)}
         />
      </div>
   )
}