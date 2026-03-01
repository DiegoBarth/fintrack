import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { YearlyBalanceSkeleton } from '@/components/dashboard/skeletons/YearlyBalanceSkeleton'

describe('YearlyBalanceSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<YearlyBalanceSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton placeholders', () => {
    const { container } = render(<YearlyBalanceSkeleton />)
    const skeletons = container.querySelectorAll('[class*="rounded"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('has chart area and stats area structure', () => {
    const { container } = render(<YearlyBalanceSkeleton />)
    const grid = container.querySelector('.grid.grid-cols-3')
    expect(grid).toBeInTheDocument()
  })
})
