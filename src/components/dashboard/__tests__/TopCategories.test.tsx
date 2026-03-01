import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TopCategories from '@/components/dashboard/TopCategories'
import type { CategorySummary } from '@/types/Dashboard'

function createCategory(overrides: Partial<CategorySummary> = {}): CategorySummary {
  return {
    category: 'Alimentação',
    total: 1500,
    ...overrides,
  }
}

describe('TopCategories', () => {
  it('returns null when categories array is empty', () => {
    const { container } = render(<TopCategories categories={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders section with title Top Categories', () => {
    render(<TopCategories categories={[createCategory()]} />)
    expect(screen.getByRole('heading', { name: 'Top Categories' })).toBeInTheDocument()
  })

  it('renders category name and formatted total', () => {
    render(<TopCategories categories={[createCategory({ category: 'Casa', total: 2000 })]} />)
    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument()
  })

  it('renders multiple categories', () => {
    render(
      <TopCategories
        categories={[
          createCategory({ category: 'Alimentação', total: 1000 }),
          createCategory({ category: 'Transporte', total: 500 }),
        ]}
      />
    )
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument()
  })
})
