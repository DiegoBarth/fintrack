import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommitmentTypeFilter, type CommitmentTypeFilterValue } from '@/components/commitments/CommitmentTypeFilter'

describe('CommitmentTypeFilter', () => {
  const onChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders group with aria-label', () => {
    render(<CommitmentTypeFilter value={null} onChange={onChange} />)
    expect(screen.getByRole('group', { name: 'Filtrar por tipo' })).toBeInTheDocument()
  })

  it('renders Todos and all commitment types from constants', () => {
    render(<CommitmentTypeFilter value={null} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fixo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Variável' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cartão' })).toBeInTheDocument()
  })

  it('calls onChange(null) when Todos is clicked', () => {
    render(<CommitmentTypeFilter value="Fixo" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('calls onChange with type when type chip is clicked', () => {
    render(<CommitmentTypeFilter value={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cartão' }))
    expect(onChange).toHaveBeenCalledWith('Cartão')
    fireEvent.click(screen.getByRole('button', { name: 'Fixo' }))
    expect(onChange).toHaveBeenCalledWith('Fixo')
  })

  it('marks selected value visually (Todos selected)', () => {
    render(<CommitmentTypeFilter value={null} onChange={onChange} />)
    const todosBtn = screen.getByRole('button', { name: 'Todos' })
    expect(todosBtn).toHaveClass('bg-primary')
  })

  it('marks selected value visually (Cartão selected)', () => {
    render(<CommitmentTypeFilter value="Cartão" onChange={onChange} />)
    const cartaoBtn = screen.getByRole('button', { name: 'Cartão' })
    expect(cartaoBtn).toHaveClass('bg-primary')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CommitmentTypeFilter value={null} onChange={onChange} className="custom-class" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })
})
