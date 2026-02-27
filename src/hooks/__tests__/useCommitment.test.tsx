import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCommitment } from '@/hooks/useCommitment'
import * as commitmentApi from '@/api/endpoints/commitment'
import type { Commitment } from '@/types/Commitment'

// ===============================
// Mocks
// ===============================
vi.mock('@/api/endpoints/commitment')
vi.mock('@/services/dashboardService')
vi.mock('@/hooks/useApiError', () => ({
  useApiError: () => ({
    handleError: vi.fn()
  })
}))

// ===============================
// Helper
// ===============================
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useCommitment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Query: list commitments', () => {
    it('should fetch commitments for the year and filter by month', async () => {
      const mockCommitments: Commitment[] = [
        {
          rowIndex: 1,
          description: 'Aluguel Janeiro',
          category: 'Casa',
          type: 'Fixo',
          amount: 2000,
          dueDate: '2026-01-10',
          referenceMonth: '2026-01'
        },
        {
          rowIndex: 2,
          description: 'Aluguel Fevereiro',
          category: 'Casa',
          type: 'Fixo',
          amount: 2000,
          dueDate: '2026-02-10',
          referenceMonth: '2026-02'
        }
      ]

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue(mockCommitments)

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      expect(commitmentApi.listCommitments).toHaveBeenCalledWith('2026')

      expect(result.current.commitments).toEqual([
        mockCommitments[0]
      ])
    })

    it('should return an empty array when no commitments are found', async () => {
      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])

      const { result } = renderHook(
        () => useCommitment('2', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      expect(result.current.commitments).toEqual([])
    })
  })

  describe('Mutation: create commitment', () => {
    it('should create a commitment', async () => {
      const newCommitment = {
        type: 'Fixo' as const,
        description: 'Academia',
        category: 'Saúde',
        amount: 150,
        dueDate: '2026-01-15',
        referenceMonth: '2026-01'
      }

      const createdCommitment: Commitment = {
        rowIndex: 10,
        ...newCommitment
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])
      vi.mocked(commitmentApi.createCommitment).mockResolvedValue([createdCommitment])

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      await result.current.create(newCommitment)

      expect(commitmentApi.createCommitment).toHaveBeenCalled()

      expect(
        vi.mocked(commitmentApi.createCommitment).mock.calls[0][0]
      ).toEqual(newCommitment)
    })
  })

  describe('Mutation: create card commitment', () => {
    it('should create a card commitment', async () => {
      const newCardExpense: Omit<Commitment, 'rowIndex'> = {
        description: 'Notebook',
        category: 'Eletrônicos',
        type: 'Cartão',
        amount: 1500,
        dueDate: '2026-01-15',
        card: 'Bradesco',
        installment: 1,
        totalInstallments: 10,
        referenceMonth: '2026-01'
      }

      const cardCreated: Commitment = {
        rowIndex: 20,
        ...newCardExpense
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])
      vi.mocked(commitmentApi.createCard).mockResolvedValue([cardCreated])

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      await result.current.createCard(newCardExpense)

      expect(commitmentApi.createCard).toHaveBeenCalled()

      expect(
        vi.mocked(commitmentApi.createCard).mock.calls[0][0]
      ).toEqual(newCardExpense)
    })
  })

  describe('Mutation: delete commitment', () => {
    it('should delete commitment with scope', async () => {
      const existingCommitment: Commitment = {
        rowIndex: 2,
        description: 'Aluguel',
        category: 'Casa',
        type: 'Fixo',
        amount: 2000,
        dueDate: '10/01/2026',
        referenceMonth: '2026-01'
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.deleteCommitment).mockResolvedValue([existingCommitment])

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      await result.current.remove({ rowIndex: 2, scope: 'future' })

      expect(commitmentApi.deleteCommitment).toHaveBeenCalled()

      expect(
        vi.mocked(commitmentApi.deleteCommitment).mock.calls[0]
      ).toEqual([2, 'future'])
    })

    it('should throw error when delete fails', async () => {
      const existingCommitment: Commitment = {
        rowIndex: 1,
        description: 'Aluguel',
        category: 'Casa',
        type: 'Fixo',
        amount: 2000,
        dueDate: '10/01/2026',
        referenceMonth: '2026-01'
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.deleteCommitment).mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      await expect(result.current.remove(1))
        .rejects.toThrow('Delete failed')
    })
  })

  describe('Mutation: update commitment', () => {
    it('should handle paymentDate removal when updating', async () => {
      const existingCommitment: Commitment = {
        rowIndex: 1,
        description: 'Aluguel',
        category: 'Casa',
        type: 'Fixo',
        amount: 2000,
        dueDate: '2026-01-10',
        paymentDate: '2026-01-10',
        referenceMonth: '2026-01'
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.updateCommitment).mockResolvedValue([
        {
          ...existingCommitment,
          paymentDate: undefined
        }
      ])

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      await result.current.update({
        rowIndex: 1,
        amount: 2000,
        paymentDate: null as any
      })

      expect(commitmentApi.updateCommitment).toHaveBeenCalled()

      expect(
        vi.mocked(commitmentApi.updateCommitment).mock.calls[0][0]
      ).toEqual({
        rowIndex: 1,
        amount: 2000,
        paymentDate: null
      })
    })

    it('should return early in updateMutation if oldCommitment is not in cache (Line 69)', async () => {
      const updatedCommitment: Commitment = {
        rowIndex: 999,
        description: 'Não no cache',
        category: 'Outros',
        type: 'Fixo',
        amount: 100,
        dueDate: '2026-01-01',
        referenceMonth: '2026-01'
      }
      vi.mocked(commitmentApi.updateCommitment).mockResolvedValue([updatedCommitment])
      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])

      const queryClient = new QueryClient()
      queryClient.setQueryData(['commitments', '2026'], [])

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCommitment('1', '2026'), { wrapper })

      await result.current.update({
        rowIndex: 999,
        amount: 100,
        paymentDate: '2026-01-10'
      })

      const cached = queryClient.getQueryData(['commitments', '2026'])
      expect(cached).toEqual([])
    })

    it('should return early in payCardStatementMutation if oldCommitment is not in cache (Line 92)', async () => {
      const updatedCommitment: Commitment = {
        rowIndex: 888,
        description: 'Cartão não no cache',
        category: 'Cartão',
        type: 'Cartão',
        amount: 100,
        dueDate: '2026-01-01',
        referenceMonth: '2026-01'
      }
      vi.mocked(commitmentApi.payCardStatement).mockResolvedValue([updatedCommitment])
      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])

      const queryClient = new QueryClient()
      queryClient.setQueryData(['commitments', '2026'], [])

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCommitment('1', '2026'), { wrapper })

      await result.current.payCardStatement({ rowIndexes: [888], paymentDate: '2026-01-10' })

      const cached = queryClient.getQueryData(['commitments', '2026'])
      expect(cached).toEqual([])
    })

    it('should throw error when updating fails', async () => {
      const existingCommitment: Commitment = {
        rowIndex: 1,
        description: 'Aluguel',
        category: 'Casa',
        type: 'Fixo',
        amount: 2000,
        dueDate: '2026-01-10',
        referenceMonth: '2026-01'
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.updateCommitment).mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper: createWrapper() }
      )

      await waitFor(() =>
        expect(result.current.isLoading).toBe(false)
      )

      await expect(
        result.current.update({
          rowIndex: 1,
          amount: 2000,
          paymentDate: '10/01/2026'
        })
      ).rejects.toThrow('Update failed')
    })


  })

  describe('Mutation: pay card statement', () => {
    it('should call payCardStatement and update cache with returned commitments', async () => {
      const existingCommitment: Commitment = {
        rowIndex: 1,
        description: 'Fatura Nubank',
        category: 'Cartão',
        type: 'Cartão',
        amount: 500,
        dueDate: '2026-01-15',
        card: 'Nubank',
        referenceMonth: '2026-01'
      }

      const updatedCommitment: Commitment = {
        ...existingCommitment,
        paymentDate: '2026-01-10'
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([existingCommitment])
      vi.mocked(commitmentApi.payCardStatement).mockResolvedValue([updatedCommitment])

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(
        () => useCommitment('1', '2026'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.payCardStatement({
        rowIndexes: [1],
        paymentDate: '2026-01-10'
      })

      expect(commitmentApi.payCardStatement).toHaveBeenCalledWith(
        expect.objectContaining({
          rowIndexes: [1],
          paymentDate: '2026-01-10'
        }),
        expect.anything()
      )

      const cached = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
      expect(cached).toHaveLength(1)
      expect(cached?.[0].paymentDate).toBe('2026-01-10')
    })
  })

  describe('Mutation: delete commitment cache by year', () => {
    it('should update cache per year when delete returns commitments from multiple years', async () => {
      const commitment2026: Commitment = {
        rowIndex: 1,
        description: 'Aluguel',
        category: 'Casa',
        type: 'Fixo',
        amount: 2000,
        dueDate: '2026-01-10',
        referenceMonth: '2026-01'
      }

      const commitment2027: Commitment = {
        rowIndex: 2,
        description: 'Aluguel',
        category: 'Casa',
        type: 'Fixo',
        amount: 2000,
        dueDate: '2027-01-10',
        referenceMonth: '2027-01'
      }

      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([commitment2026, commitment2027])
      vi.mocked(commitmentApi.deleteCommitment).mockResolvedValue([commitment2026, commitment2027])

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(
        () => useCommitment('all', '2026'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.remove({ rowIndex: 1, scope: 'future' })

      expect(commitmentApi.deleteCommitment).toHaveBeenCalledWith(1, 'future')

      const cache2026 = queryClient.getQueryData<Commitment[]>(['commitments', '2026'])
      const cache2027 = queryClient.getQueryData<Commitment[]>(['commitments', '2027'])
      expect(cache2026).toHaveLength(1)
      expect(cache2026?.[0].referenceMonth).toBe('2027-01')
      expect(cache2027).toEqual([])
    })

    it('should return early in removeMutation if deletedCommitments is empty (Line 119)', async () => {
      vi.mocked(commitmentApi.deleteCommitment).mockResolvedValue([])
      vi.mocked(commitmentApi.listCommitments).mockResolvedValue([])

      const queryClient = new QueryClient()
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCommitment('1', '2026'), { wrapper })

      await result.current.remove(1)

      expect(commitmentApi.deleteCommitment).toHaveBeenCalled()
    })
  })
})