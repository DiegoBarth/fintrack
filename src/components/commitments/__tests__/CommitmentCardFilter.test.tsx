import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommitmentCardFilter } from '@/components/commitments/CommitmentCardFilter'

describe('CommitmentCardFilter', () => {
  const onChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders group with aria-label', () => {
    render(<CommitmentCardFilter value={null} onChange={onChange} />)
    expect(screen.getByRole('group', { name: 'Filtrar por cartão' })).toBeInTheDocument()
  })

  it('renders Todos and all cards from constants', () => {
    render(<CommitmentCardFilter value={null} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bradesco' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Itaú' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mercado Pago' })).toBeInTheDocument()
  })

  it('calls onChange(null) when Todos is clicked', () => {
    render(<CommitmentCardFilter value="Bradesco" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('calls onChange with card name when card chip is clicked', () => {
    render(<CommitmentCardFilter value={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Itaú' }))
    expect(onChange).toHaveBeenCalledWith('Itaú')
  })

  it('marks selected card visually', () => {
    render(<CommitmentCardFilter value="Bradesco" onChange={onChange} />)
    const bradescoBtn = screen.getByRole('button', { name: 'Bradesco' })
    expect(bradescoBtn).toHaveClass('bg-primary')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CommitmentCardFilter value={null} onChange={onChange} className="my-class" />
    )
    expect(container.firstChild).toHaveClass('my-class')
  })
})
