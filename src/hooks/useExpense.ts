import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listExpenses,
   createExpense,
   updateExpense,
   deleteExpense
} from '@/api/endpoints/expense'
import type { Expense } from '@/types/Expense'
import { useApiError } from '@/hooks/useApiError'
import { getMonthAndYear } from '@/utils/formatters'
import { Dashboard } from '@/types/Dashboard'
import type { FullSummary } from '@/types/FullSummary'
import {
   updateDashboardAfterCreateExpense,
   updateDashboardAfterEditExpense,
   updateDashboardAfterDeleteExpense
} from '@/services/dashboardService'

export function useExpense(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()
   const queryKey = ['expenses', month, year]

   const { data: expenses = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listExpenses(month, String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const createMutation = useMutation({
      mutationFn: (newExpense: Omit<Expense, 'rowIndex'>) =>
         createExpense(newExpense),
      onSuccess: (newExpense: Expense) => {
         const { month: regisMonth, year: regisYear } = getMonthAndYear(newExpense.paymentDate)

         queryClient.setQueryData<Expense[]>(
            ['expenses', regisMonth, regisYear],
            old => old ? [...old, newExpense] : [newExpense]
         )

         const amountValue = Number(newExpense.amount)

         // Update summary cache
         const summaryData = queryClient.getQueryData<FullSummary>(['summary', regisMonth, regisYear])

         if (summaryData) {
            queryClient.setQueryData<FullSummary>(
               ['summary', regisMonth, regisYear],
               {
                  ...summaryData,
                  totalExpenses: summaryData.totalExpenses + amountValue,
                  totalPaidExpensesInMonth: summaryData.totalPaidExpensesInMonth + amountValue,
                  totalPaidExpenses: summaryData.totalPaidExpenses + amountValue
               }
            )
         }

         // Update dashboard cache
         const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', regisMonth, regisYear])

         if (dashboardData) {
            const monthIndex = Number(regisMonth) - 1
            const updatedDashboard = updateDashboardAfterCreateExpense(
               dashboardData,
               newExpense,
               monthIndex
            )

            queryClient.setQueryData<Dashboard>(
               ['dashboard', regisMonth, regisYear],
               updatedDashboard
            )
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const updateMutation = useMutation({
      mutationFn: (data: {
         rowIndex: number
         amount: number
      }) =>
         updateExpense(data),
      onSuccess: (_data, variables) => {
         const oldExpense = expenses.find(g => g.rowIndex === variables.rowIndex)

         queryClient.setQueryData<Expense[]>(
            queryKey,
            old =>
               old?.map(r =>
                  r.rowIndex === variables.rowIndex
                     ? {
                        ...r,
                        amount: variables.amount
                     }
                     : r
               ) ?? []
         )

         // Update summary and dashboard
         if (oldExpense) {
            const oldAmountNum = Number(oldExpense.amount)
            const newAmountNum = Number(variables.amount)
            const difference = newAmountNum - oldAmountNum

            // Update summary cache
            const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])
            if (summaryData) {
               queryClient.setQueryData<FullSummary>(
                  ['summary', month, year],
                  {
                     ...summaryData,
                     totalExpenses: summaryData.totalExpenses + difference,
                     totalPaidExpensesInMonth: summaryData.totalPaidExpensesInMonth + difference,
                     totalPaidExpenses: summaryData.totalPaidExpenses + difference
                  }
               )
            }

            // Update dashboard cache
            const { month: paymentMonth, year: paymentYear } = getMonthAndYear(oldExpense.paymentDate)
            const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', paymentMonth, paymentYear])

            if (dashboardData) {
               const monthIndex = Number(paymentMonth) - 1
               const updatedDashboard = updateDashboardAfterEditExpense(
                  dashboardData,
                  oldExpense,
                  variables.amount,
                  monthIndex
               )

               queryClient.setQueryData<Dashboard>(
                  ['dashboard', paymentMonth, paymentYear],
                  updatedDashboard
               )
            }
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) =>
         deleteExpense(rowIndex),
      onSuccess: (_data, rowIndex) => {
         const deletedExpense = expenses.find(g => g.rowIndex === rowIndex)

         queryClient.setQueryData<Expense[]>(
            queryKey,
            old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
         )

         if (deletedExpense) {
            const amountValue = Number(deletedExpense.amount)

            // Update summary cache
            const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])
            if (summaryData) {
               queryClient.setQueryData<FullSummary>(
                  ['summary', month, year],
                  {
                     ...summaryData,
                     totalExpenses: summaryData.totalExpenses - amountValue,
                     totalPaidExpensesInMonth: summaryData.totalPaidExpensesInMonth - amountValue,
                     totalPaidExpenses: summaryData.totalPaidExpenses - amountValue
                  }
               )
            }

            // Update dashboard cache
            const { month: paymentMonth, year: paymentYear } = getMonthAndYear(deletedExpense.paymentDate)
            const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', paymentMonth, paymentYear])

            if (dashboardData) {
               const monthIndex = Number(paymentMonth) - 1
               const updatedDashboard = updateDashboardAfterDeleteExpense(
                  dashboardData,
                  deletedExpense,
                  monthIndex
               )

               queryClient.setQueryData<Dashboard>(
                  ['dashboard', paymentMonth, paymentYear],
                  updatedDashboard
               )
            }
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   return {
      expenses,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving: createMutation.isPending || updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}