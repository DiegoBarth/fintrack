import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { usePeriod } from '@/contexts/PeriodContext'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { Button } from '@/components/ui/Button'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Expense } from '@/types/Expense'
import { useExpense } from '@/hooks/useExpense'

/**
 * Main page for Expense management.
 * Uses TanStack Query for data fetching and automatic cache synchronization.
 */
export function Expense() {
   const { month, year } = usePeriod()
   const { expenses, isLoading } = useExpense(month, String(year))
   const navigate = useNavigate()

   const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
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
               className="rounded-full shadow-lg gap-2 bg-red-600 hover:bg-red-700 text-white border-none"
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
            <ExpenseList
               expenses={expenses}
               onSelect={setSelectedExpense}
            />
         </main>

         {/* Modals */}
         <AddExpenseModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
         />

         <EditExpenseModal
            isOpen={!!selectedExpense}
            expense={selectedExpense}
            onClose={() => setSelectedExpense(null)}
         />
      </div>
   )
}