import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAlerts } from '../useAlerts'

// Mock constantes
vi.mock('@/config/constants', () => ({
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  WEEKLY_ALERT_DAYS: 7,
}))

// Mocks de contexto/hook
const mockUsePeriod = vi.fn()
vi.mock('@/contexts/PeriodContext', () => ({
  usePeriod: () => mockUsePeriod(),
}))

const mockUseCommitment = vi.fn()
vi.mock('@/hooks/useCommitment', () => ({
  useCommitment: (...args: any[]) => mockUseCommitment(...args),
}))

// Helper para criar data string dd/mm/yyyy
function formatDate(date: Date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

describe('useAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock do ano atual
    mockUsePeriod.mockReturnValue({ year: 2026 })
  })

  it('should categorize commitments correctly', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const inFiveDays = new Date(today)
    inFiveDays.setDate(today.getDate() + 5)
    const inTenDays = new Date(today)
    inTenDays.setDate(today.getDate() + 10)

    const commitments = [
      { dueDate: formatDate(yesterday), paymentDate: null }, // overdue
      { dueDate: formatDate(today), paymentDate: null }, // due today
      { dueDate: formatDate(tomorrow), paymentDate: null }, // due this week
      { dueDate: formatDate(inFiveDays), paymentDate: null }, // due this week
      { dueDate: formatDate(inTenDays), paymentDate: null }, // outside week
      { dueDate: formatDate(today), paymentDate: today }, // paid
    ]

    mockUseCommitment.mockReturnValue({
      alertCommitments: commitments,
    })

    const { result } = renderHook(() => useAlerts())

    expect(result.current.overdue).toHaveLength(1)
    expect(result.current.overdue[0].dueDate).toBe(formatDate(yesterday))

    expect(result.current.today).toHaveLength(1)
    expect(result.current.today[0].dueDate).toBe(formatDate(today))

    expect(result.current.week).toHaveLength(2)
    expect(result.current.week.map(c => c.dueDate)).toEqual([
      formatDate(tomorrow),
      formatDate(inFiveDays),
    ])
  })

  it('should return empty arrays if all commitments are paid', () => {
    const commitments = [
      { dueDate: '01/01/2026', paymentDate: new Date() },
      { dueDate: '02/01/2026', paymentDate: new Date() },
    ]

    mockUseCommitment.mockReturnValue({
      alertCommitments: commitments,
    })

    const { result } = renderHook(() => useAlerts())

    expect(result.current.overdue).toHaveLength(0)
    expect(result.current.today).toHaveLength(0)
    expect(result.current.week).toHaveLength(0)
  })

  it('should handle empty commitments', () => {
    mockUseCommitment.mockReturnValue({ alertCommitments: [] })

    const { result } = renderHook(() => useAlerts())

    expect(result.current.overdue).toEqual([])
    expect(result.current.today).toEqual([])
    expect(result.current.week).toEqual([])
  })
})