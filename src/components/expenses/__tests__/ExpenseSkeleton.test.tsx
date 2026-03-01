import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ExpenseSkeleton } from '@/components/expenses/ExpenseSkeleton'

describe('ExpenseSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ExpenseSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders multiple row placeholders', () => {
    const { container } = render(<ExpenseSkeleton />)
    const rows = container.querySelectorAll('.space-y-3 > div')
    expect(rows.length).toBe(10)
  })

  it('renders skeleton elements with rounded borders', () => {
    const { container } = render(<ExpenseSkeleton />)
    const skeletons = container.querySelectorAll('[class*="rounded"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
