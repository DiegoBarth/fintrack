import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PeriodFilters } from '@/components/home/PeriodFilters'

vi.mock('@/hooks/useSummary', () => ({
  useSummary: vi.fn(() => ({
    summary: { availableYears: [2024, 2025, 2026] },
    isLoading: false,
  })),
}))

describe('PeriodFilters', () => {
  const onMonthChange = vi.fn()
  const onYearChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders current month label', () => {
    render(
      <PeriodFilters month="1" year={2026} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    )
    expect(screen.getByRole('button', { name: /Janeiro/ })).toBeInTheDocument()
  })

  it('renders Ano Inteiro when month is all', () => {
    render(
      <PeriodFilters month="all" year={2026} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    )
    expect(screen.getByRole('button', { name: /Ano Inteiro/ })).toBeInTheDocument()
  })

  it('renders current year', () => {
    render(
      <PeriodFilters month="1" year={2025} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    )
    expect(screen.getByRole('button', { name: '2025' })).toBeInTheDocument()
  })

  it('renders two dropdown triggers (month and year)', () => {
    render(
      <PeriodFilters month="1" year={2026} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
