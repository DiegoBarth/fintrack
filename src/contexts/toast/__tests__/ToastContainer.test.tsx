import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastContainer from '../ToastContainer'
import type { Toast } from '../ToastContext'

vi.mock('../ToastItem', () => ({
  ToastItem: ({ toast, onRemove }: any) => (
    <div data-testid="toast-item">
      <span>{toast.message}</span>
      <button onClick={onRemove}>remove</button>
    </div>
  ),
}))

describe('ToastContainer', () => {
  const mockToasts: Toast[] = [
    {
      id: '1',
      message: 'Primeiro toast',
      type: 'success',
    } as Toast,
    {
      id: '2',
      message: 'Segundo toast',
      type: 'error',
    } as Toast,
  ]

  it('should render all toasts', () => {
    render(<ToastContainer toasts={mockToasts} onRemove={vi.fn()} />)

    const items = screen.getAllByTestId('toast-item')
    expect(items).toHaveLength(2)

    expect(screen.getByText('Primeiro toast')).toBeInTheDocument()
    expect(screen.getByText('Segundo toast')).toBeInTheDocument()
  })

  it('should call onRemove with correct id when a toast is removed', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<ToastContainer toasts={mockToasts} onRemove={onRemove} />)

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })

    await user.click(removeButtons[0])

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('1')
  })

  it('should render empty when there are no toasts', () => {
    render(<ToastContainer toasts={[]} onRemove={vi.fn()} />)

    expect(screen.queryByTestId('toast-item')).not.toBeInTheDocument()
  })
})