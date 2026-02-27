import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as expenseApi from '@/api/endpoints/expense'
import { apiGet, apiPost } from '@/api/client'
import { sanitizeText } from '@/utils/sanitizers'

vi.mock('@/api/client')

const mockExpenses = [
  { rowIndex: 1, description: 'Aluguel', category: 'Casa', amount: 2000, paymentDate: '2026-01-10' },
  { rowIndex: 2, description: 'Energia', category: 'Casa', amount: 300, paymentDate: '2026-01-15' }
]

describe('expense API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list expenses for a year', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockExpenses)

    const result = await expenseApi.listExpenses('2026')

    expect(apiGet).toHaveBeenCalledWith({ action: 'listExpenses', year: '2026' })
    expect(result).toEqual(mockExpenses)
  })

  it('should create an expense with sanitized text', async () => {
    const payload = {
      description: 'Aluguel <script>',
      category: 'Casa',
      amount: 2000,
      paymentDate: '2026-01-10'
    }

    vi.mocked(apiPost).mockResolvedValue([{ ...payload, rowIndex: 1 }])

    const result = await expenseApi.createExpense(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'createExpense',
      description: sanitizeText(payload.description),
      category: sanitizeText(payload.category),
      amount: 2000,
      paymentDate: '2026-01-10'
    })

    expect(result).toEqual([{ ...payload, rowIndex: 1 }])
  })

  it('should update an expense', async () => {
    const payload = { rowIndex: 1, amount: 2500 }
    vi.mocked(apiPost).mockResolvedValue([{ ...mockExpenses[0], amount: 2500 }])

    const result = await expenseApi.updateExpense(payload)

    expect(apiPost).toHaveBeenCalledWith({ action: 'updateExpense', ...payload })
    expect(result).toEqual([{ ...mockExpenses[0], amount: 2500 }])
  })

  it('should delete an expense', async () => {
    vi.mocked(apiPost).mockResolvedValue([mockExpenses[0]])

    const result = await expenseApi.deleteExpense(1)

    expect(apiPost).toHaveBeenCalledWith({ action: 'deleteExpense', rowIndex: 1 })
    expect(result).toEqual([mockExpenses[0]])
  })
})