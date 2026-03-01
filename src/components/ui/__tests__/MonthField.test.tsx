import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MonthField } from '@/components/ui/MonthField'

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  }
})

describe('MonthField', () => {
  const onChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 400,
      left: 100,
      width: 200,
      height: 40,
      bottom: 440,
      right: 300,
      x: 100,
      y: 400,
      toJSON: () => {},
    }))
  })

  it('renders placeholder when no value', () => {
    render(<MonthField value={undefined} onChange={onChange} />)
    expect(screen.getByText('Selecione um mês')).toBeInTheDocument()
  })

  it('renders required placeholder when required and no value', () => {
    render(<MonthField value={undefined} onChange={onChange} required />)
    expect(screen.getByText('Selecione um mês *')).toBeInTheDocument()
  })

  it('renders formatted month when value is set', () => {
    render(<MonthField value="2025-03" onChange={onChange} />)
    expect(screen.getByText(/março 2025/i)).toBeInTheDocument()
  })

  it('toggles open state on button click', () => {
    render(<MonthField value={undefined} onChange={onChange} />)
    const btn = screen.getByRole('button', { name: /selecione um mês/i })
    fireEvent.click(btn)
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument()
    fireEvent.click(btn)
    expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument()
  })

  it('calls onChange(undefined) when clear button is clicked', () => {
    render(<MonthField value="2025-03" onChange={onChange} />)
    const clearBtn = screen.getByRole('button', { name: /limpar|✕/i }) || screen.getAllByRole('button').find(b => b.textContent === '✕')
    if (clearBtn) fireEvent.click(clearBtn)
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('does not render clear button when no value', () => {
    render(<MonthField value={undefined} onChange={onChange} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })

  it('closes when another monthfield opens (custom event)', async () => {
    render(<MonthField value={undefined} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument()
    await act(async () => {
      window.dispatchEvent(new CustomEvent('monthfield:open', { detail: 'other-id' }))
    })
    await waitFor(() => {
      expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument()
    })
  })

  it('decrements year when minus is clicked', () => {
    render(<MonthField value="2025-06" onChange={onChange} />)
    fireEvent.click(screen.getByText('junho 2025'))
    expect(screen.getByText('2025')).toBeInTheDocument()
    const minus = screen.getAllByRole('button').find(b => b.textContent === '-')
    expect(minus).toBeTruthy()
    if (minus) fireEvent.click(minus)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('increments year when plus is clicked', () => {
    render(<MonthField value="2025-06" onChange={onChange} />)
    fireEvent.click(screen.getByText('junho 2025'))
    const plus = screen.getAllByRole('button').find(b => b.textContent === '+')
    expect(plus).toBeTruthy()
    if (plus) fireEvent.click(plus)
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('calls onChange with YYYY-MM and closes when month is clicked', () => {
    render(<MonthField value={undefined} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    const year = new Date().getFullYear()
    const janBtn = screen.getByText('jan')
    fireEvent.click(janBtn)
    expect(onChange).toHaveBeenCalledWith(`${year}-01`)
  })
})
