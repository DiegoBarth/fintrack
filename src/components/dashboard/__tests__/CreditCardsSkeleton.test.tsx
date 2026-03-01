import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CreditCardsSkeleton } from '@/components/dashboard/skeletons/CreditCardsSkeleton'

describe('CreditCardsSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CreditCardsSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders as a section', () => {
    render(<CreditCardsSkeleton />)
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('renders multiple dot placeholders', () => {
    const { container } = render(<CreditCardsSkeleton />)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots.length).toBeGreaterThanOrEqual(3)
  })
})
