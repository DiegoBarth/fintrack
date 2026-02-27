import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateCacheAfterCreateIncome,
  updateCacheAfterEditIncome,
  updateCacheAfterDeleteIncome
} from '../incomeCacheService'
import type { Income } from '@/types/Income'

vi.mock('../queryInvalidationService', () => ({
  invalidateSummaryAndDashboardCache: vi.fn()
}))

describe('incomeCacheService', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.clearAllMocks()
  })

  describe('updateCacheAfterCreateIncome', () => {
    it('should add new income to empty cache', () => {
      const newIncome: Income = {
        rowIndex: 1,
        description: 'Salário',
        expectedDate: '05/01/2026',
        amount: 5000,
        receivedDate: '05/01/2026',
        referenceMonth: '2026-01'
      }

      updateCacheAfterCreateIncome(queryClient, newIncome, '2026')

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])
      expect(cached).toHaveLength(1)
      expect(cached?.[0]).toEqual(newIncome)
    })

    it('should append and sort by expectedDate', () => {
      const existing: Income = {
        rowIndex: 1,
        description: 'A',
        expectedDate: '10/01/2026',
        amount: 1000,
        referenceMonth: '2026-01'
      }
      queryClient.setQueryData(['incomes', '2026'], [existing])

      const newIncome: Income = {
        rowIndex: 2,
        description: 'B',
        expectedDate: '05/01/2026',
        amount: 2000,
        referenceMonth: '2026-01'
      }

      updateCacheAfterCreateIncome(queryClient, newIncome, '2026')

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])
      expect(cached).toHaveLength(2)
      expect(cached?.[0].expectedDate).toBe('05/01/2026')
    })
  })

  describe('updateCacheAfterEditIncome', () => {
    it('should update income by rowIndex', () => {
      const oldIncome: Income = {
        rowIndex: 1,
        description: 'Salário',
        expectedDate: '05/01/2026',
        amount: 5000,
        referenceMonth: '2026-01'
      }
      queryClient.setQueryData(['incomes', '2026'], [oldIncome])

      updateCacheAfterEditIncome(
        queryClient,
        oldIncome,
        { amount: 5500, receivedDate: '06/01/2026' },
        '2026'
      )

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])
      expect(cached).toHaveLength(1)
      expect(cached?.[0].amount).toBe(5500)
      expect(cached?.[0].receivedDate).toBe('06/01/2026')
    })

    it('should update the correct income and keep others unchanged (Lines 33-34)', () => {
      const list: Income[] = [
        { rowIndex: 1, description: 'Não mexer', expectedDate: '01/01/2026', amount: 1000, referenceMonth: '2026-01' },
        { rowIndex: 2, description: 'Editar este', expectedDate: '05/01/2026', amount: 2000, referenceMonth: '2026-01' }
      ]
      queryClient.setQueryData(['incomes', '2026'], list)

      updateCacheAfterEditIncome(
        queryClient,
        list[1],
        { amount: 3000 },
        '2026'
      )

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])

      expect(cached?.[0].amount).toBe(1000)
      expect(cached?.[1].amount).toBe(3000)
    })

    it('should return empty array if cache is undefined (Line 33)', () => {
      queryClient.setQueryData(['incomes', '2026'], undefined)

      updateCacheAfterEditIncome(
        queryClient,
        { rowIndex: 1 } as Income,
        { amount: 500 },
        '2026'
      )

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])
      expect(cached).toEqual([])
    })
  })

  describe('updateCacheAfterDeleteIncome', () => {
    it('should remove incomes and reindex', () => {
      const list: Income[] = [
        { rowIndex: 1, description: 'A', expectedDate: '05/01/2026', amount: 1000, referenceMonth: '2026-01' },
        { rowIndex: 2, description: 'B', expectedDate: '10/01/2026', amount: 2000, referenceMonth: '2026-01' },
        { rowIndex: 3, description: 'C', expectedDate: '15/01/2026', amount: 3000, referenceMonth: '2026-01' }
      ]
      queryClient.setQueryData(['incomes', '2026'], list)

      updateCacheAfterDeleteIncome(queryClient, [list[1]], '2026')

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])
      expect(cached).toHaveLength(2)
      expect(cached?.[0].rowIndex).toBe(1)
      expect(cached?.[1].rowIndex).toBe(2)
      expect(cached?.map(i => i.description)).toEqual(['A', 'C'])
    })

    it('should return empty when cache was empty', () => {
      updateCacheAfterDeleteIncome(
        queryClient,
        [{ rowIndex: 1, description: 'X', expectedDate: '01/01/2026', amount: 0, referenceMonth: '2026-01' }],
        '2026'
      )

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])
      expect(cached).toEqual([])
    })
  })

  describe('Sorting Edge Cases (Lines 21 & 76)', () => {
    it('should sort by description when expectedDate is identical in updateCacheAfterCreateIncome (Line 21)', () => {
      const existing: Income = {
        rowIndex: 1,
        description: 'Zebra',
        expectedDate: '01/01/2026',
        amount: 1000,
        referenceMonth: '2026-01'
      }
      queryClient.setQueryData(['incomes', '2026'], [existing])

      const newIncome: Income = {
        rowIndex: 2,
        description: 'Abacate',
        expectedDate: '01/01/2026',
        amount: 500,
        referenceMonth: '2026-01'
      }

      updateCacheAfterCreateIncome(queryClient, newIncome, '2026')

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])

      expect(cached?.[0].description).toBe('Abacate')
      expect(cached?.[1].description).toBe('Zebra')
    })

    it('should sort by description when expectedDate is identical in updateCacheAfterDeleteIncome (Line 76)', () => {
      const list: Income[] = [
        { rowIndex: 1, description: 'B', expectedDate: '01/01/2026', amount: 10, referenceMonth: '01' },
        { rowIndex: 2, description: 'REMOVER', expectedDate: '10/01/2026', amount: 10, referenceMonth: '01' },
        { rowIndex: 3, description: 'A', expectedDate: '01/01/2026', amount: 10, referenceMonth: '01' },
      ]
      queryClient.setQueryData(['incomes', '2026'], list)

      updateCacheAfterDeleteIncome(queryClient, [list[1]], '2026')

      const cached = queryClient.getQueryData<Income[]>(['incomes', '2026'])

      expect(cached?.[0].description).toBe('A')
      expect(cached?.[1].description).toBe('B')
    })
  })
})
