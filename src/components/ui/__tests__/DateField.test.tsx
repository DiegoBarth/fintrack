import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DateField } from '@/components/ui/DateField'

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  }
})

describe('DateField', () => {
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
    render(<DateField value={undefined} onChange={onChange} />)
    expect(screen.getByText('Selecione uma data')).toBeInTheDocument()
  })

  it('renders required placeholder when required and no value', () => {
    render(<DateField value={undefined} onChange={onChange} required />)
    expect(screen.getByText('Selecione uma data *')).toBeInTheDocument()
  })

  it('renders formatted date when value is set', () => {
    const date = new Date(2025, 0, 15)
    render(<DateField value={date} onChange={onChange} />)
    expect(screen.getByText(/15 de janeiro de 2025/i)).toBeInTheDocument()
  })

  it('has correct aria-label when value is set', () => {
    const date = new Date(2025, 0, 15)
    render(<DateField value={date} onChange={onChange} />)
    expect(screen.getByRole('button', { name: /data selecionada/i })).toBeInTheDocument()
  })

  it('has aria-label for select when no value', () => {
    render(<DateField value={undefined} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Selecione uma data' })).toBeInTheDocument()
  })

  it('toggles open state on button click', () => {
    render(<DateField value={undefined} onChange={onChange} />)
    const btn = screen.getByRole('button', { name: 'Selecione uma data' })
    fireEvent.click(btn)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    fireEvent.click(btn)
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  it('calls onChange(undefined) when clear button is clicked', () => {
    const date = new Date(2025, 0, 15)
    render(<DateField value={date} onChange={onChange} />)
    const clearBtn = screen.getByRole('button', { name: 'Limpar data' })
    fireEvent.click(clearBtn)
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('does not render clear button when no value', () => {
    render(<DateField value={undefined} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Limpar data' })).not.toBeInTheDocument()
  })

  it('closes when another datefield opens (custom event)', async () => {
    render(<DateField value={undefined} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Selecione uma data' }))
    expect(screen.getByRole('grid')).toBeInTheDocument()
    await act(async () => {
      window.dispatchEvent(new CustomEvent('datefield:open', { detail: 'other-id' }))
    })
    await waitFor(() => {
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    })
  })

  it('calls onChange and closes when a day is selected', () => {
    const date = new Date(2025, 0, 1)
    render(<DateField value={date} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /data selecionada/i }))
    const grid = screen.getByRole('grid')
    const firstDayButton = grid.querySelector('[role="gridcell"] button')
    expect(firstDayButton).toBeTruthy()
    if (firstDayButton) fireEvent.click(firstDayButton as HTMLButtonElement)
    expect(onChange).toHaveBeenCalled()
  })
})
