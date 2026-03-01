import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TopCategoriesSkeleton } from '@/components/dashboard/skeletons/TopCategoriesSkeleton'

describe('TopCategoriesSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TopCategoriesSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders multiple category row placeholders', () => {
    const { container } = render(<TopCategoriesSkeleton />)
    const rows = container.querySelectorAll('.space-y-4 > div')
    expect(rows.length).toBe(10)
  })
})
