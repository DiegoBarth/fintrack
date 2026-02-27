import { fetchFullSummary } from '@/api/endpoints/home'
import { renderHook } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import { useSummary } from '@/hooks/useSummary'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

vi.mock('@/api/endpoints/home', () => ({
  fetchFullSummary: vi.fn(),
}))

describe('useSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return summary when query returns data', () => {
    const mockSummary = {
      totalIncome: 5000,
      totalExpenses: 3000,
      netBalance: 2000,
    }

    vi.mocked(useQuery).mockReturnValue({
      data: mockSummary,
      isLoading: false,
      isError: false,
    } as any)

    const { result } = renderHook(() => useSummary('02', '2025'))

    expect(result.current.summary).toEqual(mockSummary)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['summary', '02', '2025'],
      queryFn: expect.any(Function),
    })
  })

  it('should return default null when data is undefined', () => {
    (useQuery as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })

    const { result } = renderHook(() => useSummary('02', '2025'))

    expect(result.current.summary).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('should return loading state correctly', () => {
    (useQuery as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    })

    const { result } = renderHook(() => useSummary('02', '2025'))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.summary).toBeNull()
  })

  it('should return error state correctly', () => {
    (useQuery as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    })

    const { result } = renderHook(() => useSummary('02', '2025'))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(true)
    expect(result.current.summary).toBeNull()
  })

  it('should call fetchFullSummary with correct arguments (Line 36)', async () => {
    // 1. Capturamos os argumentos passados para o useQuery
    const { result } = renderHook(() => useSummary('02', '2025'))

    // 2. Extraímos a queryFn que o hook passou para o useQuery
    const callArgs = vi.mocked(useQuery).mock.calls[0][0]
    const queryFn = callArgs.queryFn as Function

    // 3. Executamos a função manualmente para garantir que a linha 36 seja coberta
    await queryFn()

    // 4. Verificamos se a API foi chamada com os parâmetros certos
    expect(fetchFullSummary).toHaveBeenCalledWith('02', '2025')
  })
})