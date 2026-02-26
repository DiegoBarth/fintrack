import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense, updateExpense, deleteExpense } from '@/api/endpoints/expense'
import { useApiError } from '@/hooks/useApiError'
import { getExpensesQueryOptions } from '@/services/expenseQuery'
import { getMonthAndYear } from '@/utils/formatters'
import { updateCacheAfterCreateExpense, updateCacheAfterEditExpense, updateCacheAfterDeleteExpense } from '@/services/expenseCacheService'
import type { Expense } from '@/types/Expense'

export function useExpense(month: string, year: string) {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  const { data: allExpenses = [], isLoading, isError } = useQuery(getExpensesQueryOptions(year))

  const expenses = month === 'all'
    ? allExpenses
    : allExpenses.filter(expense => {
      const { month: refMonth } =
        getMonthAndYear(expense.paymentDate)

      return String(refMonth) === String(month)
    })

  const createMutation = useMutation({
    mutationFn: (newExpense: Omit<Expense, 'rowIndex'>) =>
      createExpense(newExpense),
    onSuccess: (newExpense: Expense) => {
      const { year: yearExpense } = getMonthAndYear(newExpense.paymentDate)

      updateCacheAfterCreateExpense(
        queryClient,
        newExpense,
        yearExpense
      )
    },
    onError: handleError
  })

  const updateMutation = useMutation({
    mutationFn: (data: { rowIndex: number; amount: number }) =>
      updateExpense(data),
    onSuccess: (updatedExpense: Expense) => {
      const { year: yearExpense } = getMonthAndYear(updatedExpense.paymentDate)

      const oldExpense = queryClient
        .getQueryData<Expense[]>(['expenses', yearExpense])
        ?.find(e => e.rowIndex === updatedExpense.rowIndex)

      if (oldExpense) {
        updateCacheAfterEditExpense(
          queryClient,
          oldExpense,
          updatedExpense,
          yearExpense
        )
      }
    },
    onError: handleError
  })

  const removeMutation = useMutation({
    mutationFn: (rowIndex: number) => deleteExpense(rowIndex),
    onSuccess: (_data, rowIndex) => {
      const deletedExpense = allExpenses.find(
        e => e.rowIndex === rowIndex
      )

      if (deletedExpense) {
        const { year: yearExpense } = getMonthAndYear(deletedExpense.paymentDate)

        updateCacheAfterDeleteExpense(
          queryClient,
          deletedExpense,
          yearExpense
        )
      }
    },
    onError: handleError
  })

  return {
    expenses,
    isLoading,
    isError,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isSaving:
      createMutation.isPending || updateMutation.isPending,
    isDeleting: removeMutation.isPending
  }
}