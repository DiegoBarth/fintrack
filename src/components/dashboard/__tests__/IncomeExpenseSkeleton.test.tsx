import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { IncomeExpenseSkeleton } from '@/components/dashboard/skeletons/IncomeExpenseSkeleton'

describe('IncomeExpenseSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<IncomeExpenseSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders two progress block placeholders', () => {
    const { container } = render(<IncomeExpenseSkeleton />)
    const blocks = container.querySelectorAll('.space-y-4 > div')
    expect(blocks.length).toBe(2)
  })
})
