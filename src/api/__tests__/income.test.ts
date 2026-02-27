// src/api/__tests__/income.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as incomeApi from '@/api/endpoints/income'
import { apiGet, apiPost } from '@/api/client'
import { sanitizeText } from '@/utils/sanitizers'

vi.mock('@/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn()
}))

describe('income API', () => {
  const mockIncomes = [
    {
      rowIndex: 1,
      description: 'Salário ',
      expectedDate: '2026-01-10',
      receivedDate: '2026-01-10',
      amount: 6000,
      referenceMonth: '2026-01'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call listIncomes with correct year', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockIncomes)

    const result = await incomeApi.listIncomes('2026')

    expect(apiGet).toHaveBeenCalledWith({
      action: 'listIncomes',
      year: '2026'
    })
    expect(result).toEqual(mockIncomes)
  })

  it('should createIncome with sanitized description', async () => {
    const payload = {
      description: ' Salário <script> ',
      expectedDate: '2026-01-10',
      receivedDate: '2026-01-10',
      amount: 6000,
      referenceMonth: '2026-01'
    }

    vi.mocked(apiPost).mockResolvedValue([{ ...payload, rowIndex: 1 }])

    const result = await incomeApi.createIncome(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'createIncome',
      ...payload,
      description: sanitizeText(payload.description) // usa a função real
    })

    expect(result).toEqual([{ ...payload, rowIndex: 1 }])
  })

  it('should deleteIncome with default scope', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockIncomes)

    const result = await incomeApi.deleteIncome(1)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'deleteIncome',
      rowIndex: 1,
      scope: 'single'
    })
    expect(result).toEqual(mockIncomes)
  })

  it('should deleteIncome with future scope', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockIncomes)

    const result = await incomeApi.deleteIncome(1, 'future')

    expect(apiPost).toHaveBeenCalledWith({
      action: 'deleteIncome',
      rowIndex: 1,
      scope: 'future'
    })
    expect(result).toEqual(mockIncomes)
  })

  it('should call updateIncome and return response', async () => {
    const payload = {
      rowIndex: 1,
      amount: 6000,
      receivedDate: '2026-01-10',
      scope: 'single' as const
    }

    vi.mocked(apiPost).mockResolvedValue(mockIncomes)

    const result = await incomeApi.updateIncome(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'updateIncome',
      ...payload
    })

    expect(result).toEqual(mockIncomes)
  })

  it('should call updateIncome without receivedDate', async () => {
    const payload = {
      rowIndex: 2,
      amount: 4000,
      scope: 'single' as const
    }

    vi.mocked(apiPost).mockResolvedValue(mockIncomes)

    const result = await incomeApi.updateIncome(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'updateIncome',
      ...payload
    })

    expect(result).toEqual(mockIncomes)
  })
})