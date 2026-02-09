import { useEffect, useState, useCallback } from 'react'
import { listExpenses } from '@/api/expenses'
import type { Expense } from '@/types/Expense'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { usePeriod } from '@/contexts/PeriodContext'
import { useNavigate } from 'react-router-dom'
import { expensesCache } from '@/cache/ExpensesCache'
import { ChevronLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonList } from '@/components/ui/SkeletonList'

/**
 * Main page for Expense management.
 * Handles the listing, creation, and updating of financial outgoings.
 */
export function Expenses() {
   const { month, year } = usePeriod()
   const navigate = useNavigate()

   const [expenses, setExpenses] = useState<Expense[]>([])
   const [isLoading, setIsLoading] = useState(false)
   const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
   const [isAddModalOpen, setIsAddModalOpen] = useState(false)

   /**
    * Fetches expenses for the current period from the API.
    */
   const fetchExpenses = useCallback(async () => {
      setIsLoading(true)
      try {
         const data = await listExpenses(month, String(year))
         setExpenses(data)
      } catch (error) {
         console.error("Failed to fetch expenses:", error)
      } finally {
         setIsLoading(false)
      }
   }, [month, year])

   if (isLoading) {
      return (
         <div className="mx-auto max-w-5xl p-4">
            <SkeletonList />
         </div>
      )
   }

   useEffect(() => {
      fetchExpenses()
   }, [fetchExpenses])

   /**
    * Synchronizes the UI with cached data after any modification.
    */
   const refreshData = () => {
      const cached = expensesCache.get(month, year) || []
      setExpenses([...cached])
   }

   return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
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
               className="rounded-full shadow-lg gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
               <Plus className="h-4 w-4" />
               Novo Gasto
            </Button>
         </div>

         {/* Page Header */}
         <header>
            <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
            <p className="text-sm text-muted-foreground">
               Acompanhe suas saídas de {month}/{year}
            </p>
         </header>

         {/* List Section */}
         <main className="min-h-[400px]">
            {isLoading ? (
               <div className="flex items-center justify-center h-40">
                  <p className="text-sm animate-pulse text-muted-foreground">Buscando gastos...</p>
               </div>
            ) : expenses.length === 0 ? (
               <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                  <p className="text-gray-500">Nenhum gasto encontrado para este período.</p>
               </div>
            ) : (
               <ExpenseList
                  expenses={expenses}
                  onSelect={setSelectedExpense}
               />
            )}
         </main>

         {/* Modals */}
         <AddExpenseModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSave={refreshData}
         />

         <EditExpenseModal
            isOpen={!!selectedExpense}
            expense={selectedExpense}
            onClose={() => setSelectedExpense(null)}
            onConfirm={() => {
               refreshData()
               setSelectedExpense(null)
            }}
         />
      </div>
   )
}