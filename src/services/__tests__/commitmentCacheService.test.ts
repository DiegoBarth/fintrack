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

    it('should return an empty array when trying to edit with no data in cache', () => {
      queryClient.setQueryData(['commitments', '2026'], undefined);

      const mockCommitment: Commitment = {
        rowIndex: 1,
        description: 'Teste',
        category: 'X',
        type: 'Fixo',
        amount: 100,
        dueDate: '01/01/2026',
        referenceMonth: '01'
      };

      updateCacheAfterEditCommitment(
        queryClient,
        mockCommitment,
        { amount: 200 },
        '2026'
      );

      const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026']);

      expect(cached).toEqual([]);
    });
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

    it('should handle mapping when multiple items exist and only one matches (Lines 33-34)', () => {
      const commitments: Commitment[] = [
        {
          rowIndex: 1,
          description: 'Manter',
          category: 'Casa',
          type: 'Fixo',
          amount: 100,
          dueDate: '01/01/2026',
          referenceMonth: '2026-01'
        },
        {
          rowIndex: 2,
          description: 'Editar',
          category: 'Casa',
          type: 'Fixo',
          amount: 200,
          dueDate: '02/01/2026',
          referenceMonth: '2026-01'
        }
      ];

      queryClient.setQueryData(['commitments', '2026'], commitments);

      updateCacheAfterEditCommitment(
        queryClient,
        commitments[1],
        { amount: 500 },
        '2026'
      );

      const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026']);

      expect(cached?.[0].amount).toBe(100);
      expect(cached?.[0].description).toBe('Manter');

      expect(cached?.[1].amount).toBe(500);
    });
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

  describe('Sorting Edge Cases', () => {
    it('should sort by description when dueDate is identical in updateCacheAfterCreateCommitment', () => {
      const existing: Commitment = {
        rowIndex: 1,
        description: 'Zebra', // Começa com Z
        category: 'Casa',
        type: 'Fixo',
        amount: 1000,
        dueDate: '01/01/2026',
        referenceMonth: '2026-01'
      }
      queryClient.setQueryData(['commitments', '2026'], [existing])

      const newCommitment: Commitment = {
        rowIndex: 2,
        description: 'Abacate',
        category: 'Casa',
        type: 'Fixo',
        amount: 500,
        dueDate: '01/01/2026',
        referenceMonth: '2026-01'
      }

      updateCacheAfterCreateCommitment(queryClient, newCommitment, '2026')

      const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])

      expect(cached?.[0].description).toBe('Abacate')
      expect(cached?.[1].description).toBe('Zebra')
    })

    it('should sort by description when dueDate is identical in updateCacheAfterDeleteCommitment', () => {
      const list: Commitment[] = [
        { rowIndex: 1, description: 'B', category: 'C', type: 'Fixo', amount: 10, dueDate: '01/01/2026', referenceMonth: '01' },
        { rowIndex: 2, description: 'DELETE ME', category: 'C', type: 'Fixo', amount: 10, dueDate: '10/01/2026', referenceMonth: '01' },
        { rowIndex: 3, description: 'A', category: 'C', type: 'Fixo', amount: 10, dueDate: '01/01/2026', referenceMonth: '01' },
      ]
      queryClient.setQueryData(['commitments', '2026'], list)

      updateCacheAfterDeleteCommitment(queryClient, [list[1]], '2026')

      const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])

      expect(cached?.[0].description).toBe('A')
      expect(cached?.[1].description).toBe('B')
    })
  })
})
