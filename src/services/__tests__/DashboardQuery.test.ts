import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { getDashboardQueryOptions } from '../dashboardQuery'
import { listDashboardData } from '@/api/endpoints/dashboard'

vi.mock('@/api/endpoints/dashboard', () => ({
  listDashboardData: vi.fn(),
}))

describe('getDashboardQueryOptions', () => {
  const month = '03'
  const year = '2026'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return queryKey, queryFn, and staleTime', () => {
    const options = getDashboardQueryOptions(month, year)

    expect(options.queryKey).toEqual(['dashboard', month, year])
    expect(typeof options.queryFn).toBe('function')
    expect(options.staleTime).toBe(Infinity)
  })

  it('queryFn should call listDashboardData with correct parameters', async () => {
    const mockResponse = {
      monthlyBalance: [],
      topCategories: [],
      cardsSummary: [],
    }
      ; (listDashboardData as Mock).mockResolvedValue(mockResponse)

    const options = getDashboardQueryOptions(month, year)
    const result = await options.queryFn()

    expect(listDashboardData).toHaveBeenCalledWith(month, year)
    expect(result).toEqual(mockResponse)
  })
})