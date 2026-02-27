import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateCacheAfterCreateExpense,
  updateCacheAfterEditExpense,
  updateCacheAfterDeleteExpense
} from '../expenseCacheService'
import type { Expense } from '@/types/Expense'

vi.mock('../queryInvalidationService', () => ({
  invalidateSummaryAndDashboardCache: vi.fn()
}))

describe('expenseCacheService', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.clearAllMocks()
  })

  describe('updateCacheAfterCreateExpense', () => {
    it('should add new expense to empty cache', () => {
      const newExpense: Expense = {
        rowIndex: 1,
        description: 'Mercado',
        category: 'Alimentação',
        amount: 350,
        paymentDate: '15/01/2026'
      }

      updateCacheAfterCreateExpense(queryClient, newExpense, '2026')

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
      expect(cached).toHaveLength(1)
      expect(cached?.[0]).toEqual(newExpense)
    })

    it('should append and sort by paymentDate', () => {
      const existing: Expense = {
        rowIndex: 1,
        description: 'A',
        category: 'X',
        amount: 100,
        paymentDate: '10/01/2026'
      }
      queryClient.setQueryData(['expenses', '2026'], [existing])

      const newExpense: Expense = {
        rowIndex: 2,
        description: 'B',
        category: 'X',
        amount: 200,
        paymentDate: '05/01/2026'
      }

      updateCacheAfterCreateExpense(queryClient, newExpense, '2026')

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
      expect(cached).toHaveLength(2)
      expect(cached?.[0].paymentDate).toBe('05/01/2026')
    })
  })

  describe('updateCacheAfterEditExpense', () => {
    it('should update expense by rowIndex', () => {
      const oldExpense: Expense = {
        rowIndex: 1,
        description: 'Mercado',
        category: 'Alimentação',
        amount: 350,
        paymentDate: '15/01/2026'
      }
      queryClient.setQueryData(['expenses', '2026'], [oldExpense])

      const updatedExpense: Expense = {
        ...oldExpense,
        amount: 400
      }

      updateCacheAfterEditExpense(
        queryClient,
        oldExpense,
        updatedExpense,
        '2026'
      )

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
      expect(cached).toHaveLength(1)
      expect(cached?.[0].amount).toBe(400)
    })
  })

  describe('updateCacheAfterDeleteExpense', () => {
    it('should remove expense and reindex', () => {
      const list: Expense[] = [
        { rowIndex: 1, description: 'A', category: 'X', amount: 100, paymentDate: '10/01/2026' },
        { rowIndex: 2, description: 'B', category: 'X', amount: 200, paymentDate: '15/01/2026' },
        { rowIndex: 3, description: 'C', category: 'X', amount: 300, paymentDate: '20/01/2026' }
      ]
      queryClient.setQueryData(['expenses', '2026'], list)

      updateCacheAfterDeleteExpense(queryClient, list[1], '2026')

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
      expect(cached).toHaveLength(2)
      expect(cached?.[0].rowIndex).toBe(1)
      expect(cached?.[1].rowIndex).toBe(2)
      expect(cached?.map(e => e.description)).toEqual(['A', 'C'])
    })

    it('should return empty when deleting only item', () => {
      const expense: Expense = {
        rowIndex: 1,
        description: 'X',
        category: 'Y',
        amount: 50,
        paymentDate: '01/01/2026'
      }
      queryClient.setQueryData(['expenses', '2026'], [expense])

      updateCacheAfterDeleteExpense(queryClient, expense, '2026')

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])
      expect(cached).toEqual([])
    })
  })

  describe('Sorting Edge Cases', () => {
    it('should sort by description when paymentDate is identical in updateCacheAfterCreateExpense', () => {
      const existing: Expense = {
        rowIndex: 1,
        description: 'Zebra',
        category: 'Outros',
        amount: 100,
        paymentDate: '10/01/2026'
      }
      queryClient.setQueryData(['expenses', '2026'], [existing])

      const newExpense: Expense = {
        rowIndex: 2,
        description: 'Abacate',
        category: 'Alimentação',
        amount: 50,
        paymentDate: '10/01/2026'
      }

      updateCacheAfterCreateExpense(queryClient, newExpense, '2026')

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])

      expect(cached?.[0].description).toBe('Abacate')
      expect(cached?.[1].description).toBe('Zebra')
    })

    it('should sort by description when paymentDate is identical in updateCacheAfterDeleteExpense', () => {
      const list: Expense[] = [
        { rowIndex: 1, description: 'B', category: 'X', amount: 10, paymentDate: '01/01/2026' },
        { rowIndex: 2, description: 'REMOVE', category: 'X', amount: 10, paymentDate: '10/01/2026' },
        { rowIndex: 3, description: 'A', category: 'X', amount: 10, paymentDate: '01/01/2026' },
      ]
      queryClient.setQueryData(['expenses', '2026'], list)

      updateCacheAfterDeleteExpense(queryClient, list[1], '2026')

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])

      expect(cached?.[0].description).toBe('A')
      expect(cached?.[1].description).toBe('B')
    })

    it('should return empty array if cache is undefined in updateCacheAfterEditExpense', () => {
      queryClient.setQueryData(['expenses', '2026'], undefined);

      const expense: Expense = { rowIndex: 1, description: 'X', category: 'Y', amount: 50, paymentDate: '01/01/2026' };

      updateCacheAfterEditExpense(queryClient, expense, expense, '2026');

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026']);

      expect(cached).toEqual([]);
    });

    it('should return empty array if cache is undefined in updateCacheAfterDeleteExpense (Line 49)', () => {
      queryClient.setQueryData(['expenses', '2026'], undefined);

      const expense: Expense = { rowIndex: 1, description: 'X', category: 'Y', amount: 50, paymentDate: '01/01/2026' };

      updateCacheAfterDeleteExpense(queryClient, expense, '2026');

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026']);

      expect(cached).toEqual([]);
    });

    it('should update expense by rowIndex and keep others unchanged', () => {
      const expenses: Expense[] = [
        { rowIndex: 1, description: 'Keep', category: 'X', amount: 100, paymentDate: '10/01/2026' },
        { rowIndex: 2, description: 'Edit', category: 'X', amount: 200, paymentDate: '15/01/2026' }
      ]
      queryClient.setQueryData(['expenses', '2026'], expenses)

      const updatedExpense: Expense = {
        ...expenses[1],
        amount: 500
      }

      updateCacheAfterEditExpense(
        queryClient,
        expenses[1],
        updatedExpense,
        '2026'
      )

      const cached = queryClient.getQueryData<Expense[]>(['expenses', '2026'])

      expect(cached).toHaveLength(2)
      expect(cached?.[0].amount).toBe(100)
      expect(cached?.[1].amount).toBe(500)
    })
  })
})