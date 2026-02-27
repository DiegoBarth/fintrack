import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

// Mock focus trap to avoid DOM focus complexity
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

describe('ConfirmModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =============================
  // ✅ render behavior
  // =============================
  it('should not render when closed', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('msg')).toBeInTheDocument()
  })

  // =============================
  // ✅ accessibility
  // =============================
  it('should close on Escape when not busy', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should NOT close on Escape when busy', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
        loading
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  // =============================
  // ✅ overlay behavior
  // =============================
  it('should close when overlay is clicked', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    const overlay = document.querySelector('.bg-black\\/40')!
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should NOT close overlay click when busy', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
        loading
      />
    )

    const overlay = document.querySelector('.bg-black\\/40')!
    fireEvent.click(overlay)

    expect(onClose).not.toHaveBeenCalled()
  })

  // =============================
  // ✅ confirm flow
  // =============================
  it('should call onConfirm and then onClose', async () => {
    onConfirm.mockResolvedValueOnce(undefined)

    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /excluir/i }))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('should show loading text while submitting', async () => {
    let resolvePromise: () => void

    onConfirm.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve
        })
    )

    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /excluir/i }))

    // button should switch to loading state
    expect(await screen.findByText('Excluindo...')).toBeInTheDocument()

    // resolve promise to avoid act warnings
    resolvePromise!()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  // =============================
  // ✅ cancel button
  // =============================
  it('should close when cancel button is clicked', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // =============================
  // ✅ custom label
  // =============================
  it('should render custom confirm label when not busy', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirm"
        message="msg"
        onConfirm={onConfirm}
        confirmLabel="Confirmar exclusão"
      />
    )

    expect(
      screen.getByRole('button', { name: /confirmar exclusão/i })
    ).toBeInTheDocument()
  })
})