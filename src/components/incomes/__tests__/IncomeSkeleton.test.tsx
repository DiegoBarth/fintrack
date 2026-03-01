import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { IncomeSkeleton } from '@/components/incomes/IncomeSkeleton'

vi.mock('@/components/ui/Skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('IncomeSkeleton', () => {
  it('renders container with expected structure', () => {
    const { container } = render(<IncomeSkeleton />)
    const wrapper = container.querySelector('.pt-1.max-w-7xl')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper?.querySelector('.space-y-3')).toBeInTheDocument()
  })

  it('renders 8 skeleton rows', () => {
    render(<IncomeSkeleton />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(8)
  })

  it('renders mobile and desktop layout placeholders', () => {
    const { container } = render(<IncomeSkeleton />)
    expect(container.querySelector('.md\\:hidden')).toBeInTheDocument()
    expect(container.querySelector('.hidden.md\\:grid')).toBeInTheDocument()
  })
})
