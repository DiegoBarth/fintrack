import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
   listIncomes,
   createIncome,
   updateIncome,
   deleteIncome
} from '@/api/endpoints/income'
import type { Income } from '@/types/Income'
import { useApiError } from '@/hooks/useApiError'
import { getMonthAndYear } from '@/utils/formatters'
import { Dashboard } from '@/types/Dashboard'
import type { FullSummary } from '@/types/FullSummary'
import {
   updateDashboardAfterCreateIncome,
   updateDashboardAfterEditIncome,
   updateDashboardAfterDeleteIncome
} from '@/services/dashboardService'

export function useIncome(month: string, year: string) {
   const queryClient = useQueryClient()
   const { handleError } = useApiError()
   const queryKey = ['incomes', month, year]

   const { data: incomes = [], isLoading, isError } = useQuery({
      queryKey,
      queryFn: () => listIncomes(month, String(year)),
      staleTime: Infinity,
      retry: 1
   })

   const createMutation = useMutation({
      mutationFn: (newIncome: Omit<Income, 'rowIndex'>) =>
         createIncome(newIncome),
      onSuccess: (newIncome: Income) => {
         const { month: regisMonth, year: regisYear } = getMonthAndYear(newIncome.expectedDate)

         queryClient.setQueryData<Income[]>(
            ['incomes', regisMonth, regisYear],
            old => old ? [...old, newIncome] : [newIncome]
         )

         const amountValue = Number(newIncome.amount)

         // Update summary cache
         const summaryData = queryClient.getQueryData<FullSummary>(['summary', regisMonth, regisYear])

         if (summaryData) {
            queryClient.setQueryData<FullSummary>(
               ['summary', regisMonth, regisYear],
               {
                  ...summaryData,
                  totalIncomes: summaryData.totalIncomes + amountValue,
                  totalReceivedInMonth: newIncome.receivedDate
                     ? summaryData.totalReceivedInMonth + amountValue
                     : summaryData.totalReceivedInMonth,
                  totalReceivedAmount: newIncome.receivedDate
                     ? summaryData.totalReceivedAmount + amountValue
                     : summaryData.totalReceivedAmount
               }
            )
         }

         // Update dashboard if income was received
         if (newIncome.receivedDate) {
            const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', regisMonth, regisYear])

            if (dashboardData) {
               const monthIndex = Number(regisMonth) - 1
               const updatedDashboard = updateDashboardAfterCreateIncome(
                  dashboardData,
                  monthIndex,
                  amountValue
               )

               queryClient.setQueryData<Dashboard>(
                  ['dashboard', regisMonth, regisYear],
                  updatedDashboard
               )
            }
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
         receivedDate?: string | null
      }) =>
         updateIncome(data),
      onSuccess: (_data, variables) => {
         const oldIncome = incomes.find(r => r.rowIndex === variables.rowIndex)

         queryClient.setQueryData<Income[]>(
            queryKey,
            old =>
               old?.map(r =>
                  r.rowIndex === variables.rowIndex
                     ? {
                        ...r,
                        amount: variables.amount,
                        receivedDate: variables.receivedDate
                     }
                     : r
               ) ?? []
         )

         // Update summary cache
         if (oldIncome) {
            const summaryData = queryClient.getQueryData<FullSummary>(['summary', month, year])

            if (summaryData) {
               const oldAmountNum = Number(oldIncome.amount)
               const newAmountNum = Number(variables.amount)
               const amountDifference = newAmountNum - oldAmountNum

               const hadReceipt = !!oldIncome.receivedDate
               const hasReceipt = !!variables.receivedDate

               let nextMonthlyReceived = summaryData.totalReceivedInMonth
               let nextTotalReceived = summaryData.totalReceivedAmount

               // Case 1: Removed receipt
               if (hadReceipt && !hasReceipt) {
                  nextMonthlyReceived -= oldAmountNum
                  nextTotalReceived -= oldAmountNum
               }
               // Case 2: Added receipt
               else if (!hadReceipt && hasReceipt) {
                  nextMonthlyReceived += newAmountNum
                  nextTotalReceived += newAmountNum
               }
               // Case 3: Already had receipt, adjust value difference
               else if (hadReceipt && hasReceipt) {
                  nextMonthlyReceived += amountDifference
                  nextTotalReceived += amountDifference
               }

               queryClient.setQueryData<FullSummary>(
                  ['summary', month, year],
                  {
                     ...summaryData,
                     totalIncomes: summaryData.totalIncomes + amountDifference,
                     totalReceivedInMonth: nextMonthlyReceived,
                     totalReceivedAmount: nextTotalReceived
                  }
               )
            }
         }

         // Update dashboard if receipt status or values changed
         if (oldIncome) {
            const hadReceipt = !!oldIncome.receivedDate
            const hasReceipt = !!variables.receivedDate

            // Case 1: Removed receipt -> subtract old value from its month
            if (hadReceipt && !hasReceipt) {
               const { month: oldMonth, year: oldYear } = getMonthAndYear(oldIncome.receivedDate!)
               const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', oldMonth, oldYear])

               if (dashboardData) {
                  const monthIndex = Number(oldMonth) - 1
                  const updatedDashboard = updateDashboardAfterDeleteIncome(
                     dashboardData,
                     monthIndex,
                     Number(oldIncome.amount)
                  )

                  queryClient.setQueryData<Dashboard>(['dashboard', oldMonth, oldYear], updatedDashboard)
               }
            }

            // Case 2: Added receipt -> add new value to its month
            else if (!hadReceipt && hasReceipt) {
               const { month: newMonth, year: newYear } = getMonthAndYear(variables.receivedDate!)
               const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', newMonth, newYear])

               if (dashboardData) {
                  const monthIndex = Number(newMonth) - 1
                  const updatedDashboard = updateDashboardAfterCreateIncome(
                     dashboardData,
                     monthIndex,
                     Number(variables.amount)
                  )

                  queryClient.setQueryData<Dashboard>(['dashboard', newMonth, newYear], updatedDashboard)
               }
            }

            // Case 3: Changed value or receipt date -> move or adjust
            else if (hadReceipt && hasReceipt) {
               const { month: oldMonth, year: oldYear } = getMonthAndYear(oldIncome.receivedDate!)
               const { month: newMonth, year: newYear } = getMonthAndYear(variables.receivedDate!)

               // If the period changed, rebalance both dashboards
               if (oldMonth !== newMonth || oldYear !== newYear) {
                  // Remove from old period
                  const oldDashboard = queryClient.getQueryData<Dashboard>(['dashboard', oldMonth, oldYear])
                  if (oldDashboard) {
                     const updatedOld = updateDashboardAfterDeleteIncome(oldDashboard, Number(oldMonth) - 1, Number(oldIncome.amount))
                     queryClient.setQueryData<Dashboard>(['dashboard', oldMonth, oldYear], updatedOld)
                  }

                  // Add to new period
                  const newDashboard = queryClient.getQueryData<Dashboard>(['dashboard', newMonth, newYear])
                  if (newDashboard) {
                     const updatedNew = updateDashboardAfterCreateIncome(newDashboard, Number(newMonth) - 1, Number(variables.amount))
                     queryClient.setQueryData<Dashboard>(['dashboard', newMonth, newYear], updatedNew)
                  }
               } else {
                  // Same period, just adjust the difference
                  const dashboardData = queryClient.getQueryData<Dashboard>(['dashboard', newMonth, newYear])
                  if (dashboardData) {
                     const difference = Number(variables.amount) - Number(oldIncome.amount)
                     const updatedDashboard = updateDashboardAfterEditIncome(dashboardData, Number(newMonth) - 1, difference)
                     queryClient.setQueryData<Dashboard>(['dashboard', newMonth, newYear], updatedDashboard)
                  }
               }
            }
         }
      },
      onError: (error) => {
         handleError(error)
      }
   })

   const removeMutation = useMutation({
      mutationFn: (rowIndex: number) =>
         deleteIncome(rowIndex, month, String(year)),
      onSuccess: (_data, rowIndex) => {
         queryClient.setQueryData<Income[]>(
            queryKey,
            old => old?.filter(r => r.rowIndex !== rowIndex) ?? []
         )
      },
      onError: (error) => {
         handleError(error)
      }
   })

   return {
      incomes,
      isLoading,
      isError,
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: removeMutation.mutateAsync,
      isSaving: createMutation.isPending || updateMutation.isPending,
      isDeleting: removeMutation.isPending
   }
}