import { describe, it, expect, vi } from 'vitest'
import { syncReferenceMonthFromDate } from '@/utils/periodFromDate'

describe('syncReferenceMonthFromDate', () => {
  it('calls setReferenceMonth with YYYY-MM from date', () => {
    const setReferenceMonth = vi.fn()
    syncReferenceMonthFromDate(new Date(2026, 2, 1), setReferenceMonth)
    expect(setReferenceMonth).toHaveBeenCalledWith('2026-03')
  })

  it('does nothing when date is undefined', () => {
    const setReferenceMonth = vi.fn()
    syncReferenceMonthFromDate(undefined, setReferenceMonth)
    expect(setReferenceMonth).not.toHaveBeenCalled()
  })
})
