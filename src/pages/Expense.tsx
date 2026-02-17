import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { Button } from '@/components/ui/Button'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Expense } from '@/types/Expense'
import { useExpense } from '@/hooks/useExpense'
import { Layout } from '@/components/layout/Layout'
import { Plus } from 'lucide-react'

export function Expense() {
   const { month, year } = usePeriod()
   const { expenses, isLoading } = useExpense(month, String(year))
   const navigate = useNavigate()
   const handleBack = () => navigate('/')

   const [expenseSelected, setExpenseSelected] = useState<Expense | null>(null)
   const [modalIsOpen, setModalOpen] = useState(false)

   if (isLoading) {
      return (
         <Layout title="Gastos" onBack={handleBack}>
            <SkeletonList />
         </Layout>
      )
   }

   const headerSlot = (
      <Button
         size="sm"
         variant="destructive"
         className="rounded-full shadow-sm"
         onClick={() => setModalOpen(true)}
      >
         <Plus className="size-4" />
         Novo Gasto
      </Button>
   )

   return (
      <Layout title="Gastos" onBack={handleBack} headerSlot={headerSlot}>
         <div className="pt-1">
            <ExpenseList
               expenses={expenses}
               onSelect={setExpenseSelected}
            />
         </div>

         <AddExpenseModal
            isOpen={modalIsOpen}
            onClose={() => setModalOpen(false)}
         />

         <EditExpenseModal
            isOpen={!!expenseSelected}
            expense={expenseSelected}
            onClose={() => setExpenseSelected(null)}
         />
      </Layout>
   )
}