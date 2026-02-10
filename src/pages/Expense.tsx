import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Expense } from '@/types/Expense'
import { useExpense } from '@/hooks/useExpense'
import { Layout } from '@/components/layout/Layout'

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

   return (
      <Layout title="Gastos" onBack={handleBack}>
         <div className="flex justify-end mb-4">
            <button
               onClick={() => setModalOpen(true)}
               className="rounded-full px-5 py-2 text-white font-medium shadow-md hover:brightness-90 transition"
               style={{ backgroundColor: 'rgb(239, 68, 68)' }}
            >
               + Novo Gasto
            </button>
         </div>

         <ExpenseList
            expenses={expenses}
            onSelect={setExpenseSelected}
         />

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