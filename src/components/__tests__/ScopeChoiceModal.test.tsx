import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScopeChoiceModal } from '@/components/ScopeChoiceModal'

vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

describe('ScopeChoiceModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <ScopeChoiceModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true with edit title by default', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Alterar registro')).toBeInTheDocument()
    expect(screen.getByText(/alterar/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /somente este/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /este e os próximos/i })).toBeInTheDocument()
  })

  it('should render with delete title when isDelete is true', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        isDelete
      />
    )

    expect(screen.getByText('Excluir registro')).toBeInTheDocument()
    expect(screen.getByText(/excluir/)).toBeInTheDocument()
  })

  it('should call onConfirm with "single" when "Somente este" is clicked', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /somente este/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith('single')
  })

  it('should call onConfirm with "future" when "Este e os próximos" is clicked', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /este e os próximos/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith('future')
  })

  it('should call onClose when overlay is clicked', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    const overlay = document.querySelector('.bg-black\\/40')
    expect(overlay).toBeInTheDocument()
    fireEvent.click(overlay!)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Cancelar button is clicked', () => {
    render(
      <ScopeChoiceModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancelar e fechar modal/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
