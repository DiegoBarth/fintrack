import { useEffect, useState, useCallback } from 'react'
import { listIncomes } from '@/api/incomes'
import type { Income } from '@/types/Income'
import { IncomeList } from '@/components/incomes/IncomeList'
import { EditIncomeModal } from '@/components/incomes/EditIncomeModal'
import { AddIncomeModal } from '@/components/incomes/AddIncomeModal'
import { usePeriod } from '@/contexts/PeriodContext'
import { useNavigate } from 'react-router-dom'
import { incomesCache } from '@/cache/IncomesCache'
import { ChevronLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonList } from '@/components/ui/SkeletonList'

/**
 * Main page for Income management.
 * Orchestrates data fetching, listing, and modal states for adding/editing incomes.
 */
export function Incomes() {
   const { month, year } = usePeriod()
   const navigate = useNavigate()

   const [incomes, setIncomes] = useState<Income[]>([])
   const [isLoading, setIsLoading] = useState(false)
   const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
   const [isAddModalOpen, setIsAddModalOpen] = useState(false)

   /**
    * Fetches incomes from the API for the current selected period.
    */
   const fetchIncomes = useCallback(async () => {
      setIsLoading(true)
      try {
         const data = await listIncomes(month, String(year))
         setIncomes(data)
      } catch (error) {
         console.error("Failed to fetch incomes:", error)
      } finally {
         setIsLoading(false)
      }
   }, [month, year])

   useEffect(() => {
      fetchIncomes()
   }, [fetchIncomes])

   if (isLoading) {
      return (
         <div className="mx-auto max-w-5xl p-4">
            <SkeletonList />
         </div>
      )
   }

   /**
    * Updates local state with cached data after a mutation (add/edit/delete).
    */
   const refreshData = () => {
      const cached = incomesCache.get(month, year) || []
      setIncomes([...cached])
   }

   return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
         {/* Navigation & Header */}
         <div className="flex items-center justify-between">
            <button
               onClick={() => navigate('/')}
               className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
            >
               <ChevronLeft className="h-4 w-4" />
               Voltar
            </button>

            <Button
               onClick={() => setIsAddModalOpen(true)}
               className="rounded-full shadow-lg gap-2"
            >
               <Plus className="h-4 w-4" />
               Nova receita
            </Button>
         </div>

         <header>
            <h1 className="text-2xl font-bold tracking-tight">Receitas</h1>
            <p className="text-sm text-muted-foreground">
               Gerencie suas entradas para o período de {month}/{year}
            </p>
         </header>

         {/* Content Area */}
         <main className="min-h-[400px]">
            {isLoading ? (
               <div className="flex items-center justify-center h-40">
                  <p className="text-sm animate-pulse">Carregando receitas...</p>
               </div>
            ) : (
               <IncomeList
                  incomes={incomes}
                  onSelect={setSelectedIncome}
               />
            )}
         </main>

         {/* Modals */}
         <AddIncomeModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSave={refreshData}
         />

         <EditIncomeModal
            isOpen={!!selectedIncome}
            income={selectedIncome}
            onClose={() => setSelectedIncome(null)}
            onConfirm={() => {
               refreshData()
               setSelectedIncome(null)
            }}
         />
      </div>
   )
}