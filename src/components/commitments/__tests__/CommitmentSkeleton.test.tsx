import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CommitmentSkeleton } from '@/components/commitments/CommitmentSkeleton'

describe('CommitmentSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommitmentSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton placeholders for list items', () => {
    render(<CommitmentSkeleton />)
    const skeletons = document.querySelectorAll('[class*="animate-pulse"], [class*="rounded"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders multiple list item placeholders', () => {
    const { container } = render(<CommitmentSkeleton />)
    const skeletons = container.querySelectorAll('[class*="rounded-lg"][class*="border"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(6)
  })
})
