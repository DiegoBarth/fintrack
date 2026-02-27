import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseModal } from '@/components/ui/BaseModal'

// Mock focus trap hook to avoid DOM focus complexity
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

describe('BaseModal', () => {
  const onClose = vi.fn()
  const onSave = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =============================
  // ✅ render behavior
  // =============================
  it('should not render when isOpen is false', () => {
    render(
      <BaseModal isOpen={false} onClose={onClose} type="create">
        <div>content</div>
      </BaseModal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render dialog when open', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create" title="My Modal">
        <div>content</div>
      </BaseModal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  // =============================
  // ✅ accessibility
  // =============================
  it('should set aria-labelledby when title is provided', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create" title="Modal Title">
        <div>content</div>
      </BaseModal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-titulo')
  })

  it('should not set aria-labelledby when title is not provided', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create">
        <div>content</div>
      </BaseModal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).not.toHaveAttribute('aria-labelledby')
  })

  // =============================
  // ✅ close behaviors
  // =============================
  it('should close when overlay is clicked', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create">
        <div>content</div>
      </BaseModal>
    )

    // overlay is the backdrop div
    const overlay = document.querySelector('.bg-black\\/40')!
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should close when Escape key is pressed', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create">
        <div>content</div>
      </BaseModal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should NOT close on Escape when loading', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create" isLoading>
        <div>content</div>
      </BaseModal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  // =============================
  // ✅ header behavior
  // =============================
  it('should render close button when title exists', () => {
    render(
      <BaseModal isOpen onClose={onClose} type="create" title="Title">
        <div>content</div>
      </BaseModal>
    )

    expect(
      screen.getByRole('button', { name: /^fechar modal$/i })
    ).toBeInTheDocument()
  })

  it('should disable close button when loading', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        type="create"
        title="Title"
        isLoading
      >
        <div>content</div>
      </BaseModal>
    )

    const btn = screen.getByRole('button', { name: /^fechar modal$/i })
    expect(btn).toBeDisabled()
  })

  // =============================
  // ✅ footer buttons
  // =============================
  it('should call onSave when save button is clicked', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        type="create"
      >
        <div>content</div>
      </BaseModal>
    )

    fireEvent.click(
      screen.getByRole('button', { name: /salvar novo registro/i })
    )

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('should render delete button only in edit mode', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        onDelete={onDelete}
        type="edit"
      >
        <div>content</div>
      </BaseModal>
    )

    expect(
      screen.getByRole('button', {
        name: /excluir registro permanentemente/i,
      })
    ).toBeInTheDocument()
  })

  it('should NOT render delete button in create mode', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        onDelete={onDelete}
        type="create"
      >
        <div>content</div>
      </BaseModal>
    )

    expect(
      screen.queryByRole('button', {
        name: /excluir registro permanentemente/i,
      })
    ).not.toBeInTheDocument()
  })

  it('should show deleting text when loading and deleting', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        onDelete={onDelete}
        type="edit"
        isLoading
        loadingText="Excluindo..."
      >
        <div>content</div>
      </BaseModal>
    )

    expect(screen.getByText('Excluindo...')).toBeInTheDocument()
  })

  it('should show custom loading text on save', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        type="create"
        isLoading
        loadingText="Salvando dados..."
      >
        <div>content</div>
      </BaseModal>
    )

    expect(screen.getByText('Salvando dados...')).toBeInTheDocument()
  })

  it('should disable footer buttons when loading', () => {
    render(
      <BaseModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        type="create"
        isLoading
      >
        <div>content</div>
      </BaseModal>
    )

    const cancelBtn = screen.getByRole('button', {
      name: /cancelar e fechar modal/i,
    })

    const saveBtn = screen.getByRole('button', {
      name: /salvar novo registro/i,
    })

    expect(cancelBtn).toBeDisabled()
    expect(saveBtn).toBeDisabled()
  })
  // should use create aria-label when type is create
  // should use create aria-label when type is create
  it('should render create aria-label', () => {
    render(
      <BaseModal
        isOpen
        type="create"
        title="Teste"
        onClose={vi.fn()}
        onSave={vi.fn()}
      >
        <div /> {/* required children */}
      </BaseModal>
    )

    expect(
      screen.getByRole('button', { name: /salvar novo registro/i })
    ).toBeInTheDocument()
  })
  // should use edit aria-label when type is not create
  // should use edit aria-label when type is not create
  it('should render edit aria-label', () => {
    render(
      <BaseModal
        isOpen
        type="edit"
        title="Teste"
        onClose={vi.fn()}
        onSave={vi.fn()}
      >
        <div /> {/* required children */}
      </BaseModal>
    )

    expect(
      screen.getByRole('button', { name: /salvar alterações/i })
    ).toBeInTheDocument()
  })
})