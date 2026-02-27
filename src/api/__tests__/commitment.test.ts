import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as commitmentApi from '@/api/endpoints/commitment'
import { apiGet, apiPost } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn()
}))

describe('commitment API', () => {
  const mockCommitments = [
    {
      rowIndex: 1,
      description: 'Aluguel',
      category: 'Casa',
      type: 'Fixo',
      amount: 2000,
      dueDate: '2026-01-10',
      referenceMonth: '2026-01'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call listCommitments with correct year', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockCommitments)

    const result = await commitmentApi.listCommitments('2026')

    expect(apiGet).toHaveBeenCalledWith({
      action: 'listCommitments',
      year: '2026'
    })
    expect(result).toEqual(mockCommitments)
  })

  it('should call createCommitment with sanitized payload', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const payload = {
      description: ' Aluguel ',
      category: ' Casa ',
      type: 'Fixo' as const,
      amount: 2000,
      dueDate: '2026-01-10',
      referenceMonth: '2026-01'
    }

    const result = await commitmentApi.createCommitment(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'createCommitment',
      ...payload,
      description: 'Aluguel',
      category: 'Casa',
      type: 'Fixo'
    })
    expect(result).toEqual(mockCommitments)
  })

  it('should call createCard with sanitized payload', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const payload = {
      description: ' Cartão ',
      category: ' Casa ',
      card: ' Nubank ',
      amount: 100,
      type: 'Variável',
      dueDate: '2026-01-15',
      referenceMonth: '2026-01'
    }

    const result = await commitmentApi.createCard(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'createCard',
      ...payload,
      description: 'Cartão',
      category: 'Casa',
      card: 'Nubank',
      type: 'Variável'
    })
    expect(result).toEqual(mockCommitments)
  })

  it('should call createCard with undefined card if not provided', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const payload = {
      description: ' Cartão ',
      category: ' Casa ',
      // card ausente
      amount: 100,
      type: 'Variável',
      dueDate: '2026-01-15',
      referenceMonth: '2026-01'
    }

    const result = await commitmentApi.createCard(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'createCard',
      ...payload,
      description: 'Cartão',
      category: 'Casa',
      card: undefined,
      type: 'Variável'
    })

    expect(result).toEqual(mockCommitments)
  })

  it('should call deleteCommitment with default scope', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const result = await commitmentApi.deleteCommitment(1)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'deleteCommitment',
      rowIndex: 1,
      scope: 'single'
    })
    expect(result).toEqual(mockCommitments)
  })

  it('should call deleteCommitment with custom scope', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const result = await commitmentApi.deleteCommitment(1, 'all')

    expect(apiPost).toHaveBeenCalledWith({
      action: 'deleteCommitment',
      rowIndex: 1,
      scope: 'all'
    })
    expect(result).toEqual(mockCommitments)
  })

  it('should call updateCommitment', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const payload = {
      rowIndex: 1,
      amount: 2000,
      paymentDate: '2026-01-10',
      scope: 'single' as const
    }

    const result = await commitmentApi.updateCommitment(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'updateCommitment',
      ...payload
    })

    expect(result).toEqual(mockCommitments)
  })

  it('should call payCardStatement', async () => {
    vi.mocked(apiPost).mockResolvedValue(mockCommitments)

    const payload = {
      rowIndexes: [1, 2],
      paymentDate: '2026-01-15'
    }

    const result = await commitmentApi.payCardStatement(payload)

    expect(apiPost).toHaveBeenCalledWith({
      action: 'payCardStatement',
      ...payload
    })
    expect(result).toEqual(mockCommitments)
  })
})