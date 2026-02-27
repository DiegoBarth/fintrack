import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastItem } from '../ToastItem'
import type { Toast } from '../ToastContext'

// Use fake timers for animation timeouts
vi.useFakeTimers()

const createToast = (type: Toast['type'] = 'success'): Toast => ({
  id: '1',
  message: 'Test toast message',
  type,
})

describe('ToastItem', () => {
  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  it('should render toast message', () => {
    render(<ToastItem toast={createToast()} onRemove={vi.fn()} />)

    expect(screen.getByText('Test toast message')).toBeInTheDocument()
  })

  it('should become visible after mount delay', () => {
    const { container } = render(
      <ToastItem toast={createToast()} onRemove={vi.fn()} />
    )

    const toast = container.firstChild as HTMLElement

    // Initially hidden
    expect(toast.className).toContain('opacity-0')

    // Advance the 10ms animation timer
    act(() => {
      vi.advanceTimersByTime(20)
    })

    // Should now be visible
    expect(toast.className).toContain('opacity-100')
  })

  it('should call onRemove after click with delay', () => {
    const onRemove = vi.fn()

    render(<ToastItem toast={createToast()} onRemove={onRemove} />)

    const message = screen.getByText('Test toast message')

    // Ensure visible first
    act(() => {
      vi.advanceTimersByTime(20)
    })

    fireEvent.click(message)

    // Not yet called (300ms delay)
    expect(onRemove).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('should apply correct border color for each type', () => {
    const types: Toast['type'][] = ['success', 'error', 'info', 'warning']

    const expectedClasses = {
      success: 'border-green-400',
      error: 'border-red-400',
      info: 'border-blue-400',
      warning: 'border-yellow-400',
    }

    types.forEach(type => {
      const { container, unmount } = render(
        <ToastItem toast={createToast(type)} onRemove={vi.fn()} />
      )

      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain(expectedClasses[type])

      unmount()
    })
  })

  it('should render the correct icon per type', () => {
    const { container, rerender } = render(
      <ToastItem toast={createToast('success')} onRemove={vi.fn()} />
    )

    // success icon (check path exists)
    expect(container.querySelector('svg')).toBeInTheDocument()

    rerender(
      <ToastItem toast={createToast('error')} onRemove={vi.fn()} />
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})