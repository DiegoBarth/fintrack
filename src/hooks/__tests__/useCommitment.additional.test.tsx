import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCommitment } from '../useCommitment'
import * as commitmentApi from '@/api/endpoints/commitment'
import type { Commitment } from '@/types/Commitment'

// Mocks
vi.mock('@/api/endpoints/commitment')
vi.mock('@/hooks/useApiError', () => ({
   useApiError: () => ({
      handleError: vi.fn()
   })
}))

describe('useCommitment - updated architecture', () => {
   let queryClient: QueryClient

   beforeEach(() => {
      vi.clearAllMocks()
      queryClient = new QueryClient({
         defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
         }
      })
   })

   const createWrapper = () => {
      return ({ children }: { children: React.ReactNode }) => (
         <QueryClientProvider client={queryClient}>
            {children}
         </QueryClientProvider>
      )
   }

   // ================================
   // LOAD
   // ================================
   it('should load commitments for the year', async () => {
      const commitments: Commitment[] = [
         {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '2026-01-10'
         }
      ]

      vi.mocked(commitmentApi.listCommitments)
         .mockResolvedValue(commitments)

      const { result } = renderHook(
         () => useCommitment('all', '2026'),
         { wrapper: createWrapper() }
      )

      await waitFor(() => {
         expect(result.current.commitments).toEqual(commitments)
      })

      // Agora deve buscar apenas por ano
      expect(commitmentApi.listCommitments)
         .toHaveBeenCalledWith('all', '2026')
   })

   // ================================
   // CREATE CARD
   // ================================
   it('should create card commitment and invalidate aggregates', async () => {
      const newCard: Omit<Commitment, 'rowIndex'> = {
         type: 'Cartão',
         description: 'Fatura Nubank',
         category: 'Alimentação',
         amount: 850,
         dueDate: '2026-01-15',
         card: 'Nubank',
         installment: 1,
         totalInstallments: 1
      }

      const created: Commitment = {
         rowIndex: 10,
         ...newCard
      }

      vi.mocked(commitmentApi.listCommitments)
         .mockResolvedValue([])

      vi.mocked(commitmentApi.createCard)
         .mockResolvedValue([created])

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(
         () => useCommitment('all', '2026'),
         { wrapper: createWrapper() }
      )

      await waitFor(() =>
         expect(result.current.isLoading).toBe(false)
      )

      await result.current.createCard(newCard)

      expect(commitmentApi.createCard)
         .toHaveBeenCalled()

      expect(vi.mocked(commitmentApi.createCard).mock.calls[0][0])
         .toEqual(newCard)


      expect(invalidateSpy).toHaveBeenCalledWith({
         queryKey: ['summary'],
         exact: false
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
         queryKey: ['dashboard'],
         exact: false
      })
   })

   // ================================
   // DELETE
   // ================================
   it('should delete commitment and invalidate aggregates', async () => {
      const existing: Commitment = {
         rowIndex: 1,
         description: 'Aluguel',
         category: 'Casa',
         type: 'Fixo',
         amount: 2000,
         dueDate: '2026-01-10'
      }

      vi.mocked(commitmentApi.listCommitments)
         .mockResolvedValue([existing])

      vi.mocked(commitmentApi.deleteCommitment)
         .mockResolvedValue([existing])

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(
         () => useCommitment('all', '2026'),
         { wrapper: createWrapper() }
      )

      await waitFor(() =>
         expect(result.current.isLoading).toBe(false)
      )

      await result.current.remove(1)

      expect(commitmentApi.deleteCommitment)
         .toHaveBeenCalledWith(1)

      expect(invalidateSpy).toHaveBeenCalledWith({
         queryKey: ['summary'],
         exact: false
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
         queryKey: ['dashboard'],
         exact: false
      })
   })
})