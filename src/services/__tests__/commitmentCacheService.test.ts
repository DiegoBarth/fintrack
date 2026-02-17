import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
   updateCacheAfterCreateCommitment,
   updateCacheAfterEditCommitment,
   updateCacheAfterDeleteCommitment
} from '../commitmentCacheService'
import type { Commitment } from '@/types/Commitment'

vi.mock('../queryInvalidationService', () => ({
   invalidateSummaryAndDashboardCache: vi.fn()
}))

describe('commitmentCacheService', () => {
   let queryClient: QueryClient

   beforeEach(() => {
      queryClient = new QueryClient()
      vi.clearAllMocks()
   })

   describe('updateCacheAfterCreateCommitment', () => {
      it('should add new commitment to empty cache', () => {
         const newCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '10/01/2026',
            referenceMonth: '2026-01'
         }

         updateCacheAfterCreateCommitment(queryClient, newCommitment, '2026')

         const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
         expect(cached).toHaveLength(1)
         expect(cached?.[0]).toEqual(newCommitment)
      })

      it('should append new commitment and keep sort by dueDate', () => {
         const existing: Commitment = {
            rowIndex: 1,
            description: 'Primeiro',
            category: 'Casa',
            type: 'Fixo',
            amount: 1000,
            dueDate: '05/01/2026',
            referenceMonth: '2026-01'
         }
         queryClient.setQueryData(['commitments', '2026'], [existing])

         const newCommitment: Commitment = {
            rowIndex: 2,
            description: 'Segundo',
            category: 'Casa',
            type: 'Fixo',
            amount: 500,
            dueDate: '01/01/2026',
            referenceMonth: '2026-01'
         }

         updateCacheAfterCreateCommitment(queryClient, newCommitment, '2026')

         const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
         expect(cached).toHaveLength(2)
         expect(cached?.[0].dueDate).toBe('01/01/2026')
         expect(cached?.[1].dueDate).toBe('05/01/2026')
      })
   })

   describe('updateCacheAfterEditCommitment', () => {
      it('should update commitment by rowIndex', () => {
         const oldCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '10/01/2026',
            referenceMonth: '2026-01'
         }
         queryClient.setQueryData(['commitments', '2026'], [oldCommitment])

         updateCacheAfterEditCommitment(
            queryClient,
            oldCommitment,
            { amount: 2500, paymentDate: '09/01/2026' },
            '2026'
         )

         const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
         expect(cached).toHaveLength(1)
         expect(cached?.[0].amount).toBe(2500)
         expect(cached?.[0].paymentDate).toBe('09/01/2026')
      })
   })

   describe('updateCacheAfterDeleteCommitment', () => {
      it('should remove commitments and reindex rowIndex', () => {
         const list: Commitment[] = [
            {
               rowIndex: 1,
               description: 'A',
               category: 'Casa',
               type: 'Fixo',
               amount: 100,
               dueDate: '01/01/2026',
               referenceMonth: '2026-01'
            },
            {
               rowIndex: 2,
               description: 'B',
               category: 'Casa',
               type: 'Fixo',
               amount: 200,
               dueDate: '05/01/2026',
               referenceMonth: '2026-01'
            },
            {
               rowIndex: 3,
               description: 'C',
               category: 'Casa',
               type: 'Fixo',
               amount: 300,
               dueDate: '10/01/2026',
               referenceMonth: '2026-01'
            }
         ]
         queryClient.setQueryData(['commitments', '2026'], list)

         updateCacheAfterDeleteCommitment(
            queryClient,
            [list[1]],
            '2026'
         )

         const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
         expect(cached).toHaveLength(2)
         expect(cached?.[0].rowIndex).toBe(1)
         expect(cached?.[1].rowIndex).toBe(2)
         expect(cached?.map(c => c.description)).toEqual(['A', 'C'])
      })

      it('should return empty array when cache is empty', () => {
         updateCacheAfterDeleteCommitment(
            queryClient,
            [{ rowIndex: 1, description: 'X', category: '', type: 'Fixo', amount: 0, dueDate: '01/01/2026', referenceMonth: '2026-01' }],
            '2026'
         )

         const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
         expect(cached).toEqual([])
      })
   })
})
