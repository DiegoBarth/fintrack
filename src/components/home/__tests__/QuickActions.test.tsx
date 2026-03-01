import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import QuickActions from '@/components/home/QuickActions'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('QuickActions', () => {
  it('renders title Ações rápidas', () => {
    renderWithRouter(<QuickActions />)
    expect(screen.getByRole('heading', { name: 'Ações rápidas' })).toBeInTheDocument()
  })

  it('renders links to Receitas Gastos Compromissos Dashboard', () => {
    renderWithRouter(<QuickActions />)
    expect(screen.getByRole('link', { name: /Receitas/ })).toHaveAttribute('href', '/incomes')
    expect(screen.getByRole('link', { name: /Gastos/ })).toHaveAttribute('href', '/expenses')
    expect(screen.getByRole('link', { name: /Compromissos/ })).toHaveAttribute('href', '/commitments')
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/dashboard')
  })

  it('renders four action links', () => {
    renderWithRouter(<QuickActions />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
  })
})
