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
})
