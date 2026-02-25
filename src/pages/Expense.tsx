import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { usePeriod } from '@/contexts/PeriodContext'
import type { Expense } from '@/types/Expense'
import { useExpense } from '@/hooks/useExpense'
import { Layout } from '@/components/layout/Layout'
import { numberToCurrency } from '@/utils/formatters'
import { format } from 'date-fns/format'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Plus } from 'lucide-react'

export default function Expense() {
   const { month, year } = usePeriod()
   const { expenses, isLoading } = useExpense(month, String(year))
   const navigate = useNavigate()
   const handleBack = () => navigate('/')

   const [expenseSelected, setExpenseSelected] = useState<Expense | null>(null)
   const [modalIsOpen, setModalOpen] = useState(false)

   const headerSubtitle = useMemo(() => {
      const raw =
         month === 'all'
            ? String(year)
            : format(new Date(Number(year), Number(month) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })
      const monthLabel = month === 'all' ? raw : raw.charAt(0).toUpperCase() + raw.slice(1)
      const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
      return `${monthLabel} • Total: ${numberToCurrency(total)}`
   }, [month, year, expenses])

   if (isLoading) {
      return (
         <Layout title="Gastos" onBack={handleBack} headerVariant="expense">
            <SkeletonList />
         </Layout>
      )
   }

   return (
      <Layout title="Gastos" onBack={handleBack} subtitle={headerSubtitle} headerVariant="expense">
         <div className="pt-1 pb-20">
            <ExpenseList
               expenses={expenses}
               onSelect={setExpenseSelected}
            />
         </div>

         <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Novo gasto"
         >
            <Plus className="h-7 w-7" />
         </button>

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