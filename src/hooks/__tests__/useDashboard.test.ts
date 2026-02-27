import { renderHook } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import { useDashboard } from '../useDashboard'
import { getDashboardQueryOptions } from '@/services/dashboardQuery'
import { Dashboard } from '@/types/Dashboard'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

vi.mock('@/services/dashboardQuery', () => ({
  getDashboardQueryOptions: vi.fn(() => ({
    queryKey: ['dashboard'],
    queryFn: vi.fn()
  })),
}))

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return data when query returns data', () => {
    const mockData: Dashboard = {
      monthlyBalance: [
        { date: '2026-03-01', balance: 100 },
        { date: '2026-03-02', balance: 200 },
      ],
      topCategories: [
        { category: 'Food', total: 150 },
        { category: 'Transport', total: 50 },
      ],
      cardsSummary: [
        {
          cardName: 'Visa',
          image: 'visa.png',
          totalLimit: 1000,
          availableLimit: 500,
          usedPercentage: 50,
          statementTotal: 500,
        },
      ],
    }

    vi.mocked(useQuery).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    } as any)

    const { result } = renderHook(() => useDashboard('03', '2026'))

    expect(result.current.dashboard).toEqual(mockData)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(getDashboardQueryOptions).toHaveBeenCalledWith('03', '2026')
  })

  it('should return default values when data is undefined', () => {
    (useQuery as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })

    const { result } = renderHook(() => useDashboard('03', '2026'))

    expect(result.current.dashboard).toEqual({
      monthlyBalance: [],
      topCategories: [],
      cardsSummary: [],
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })
})