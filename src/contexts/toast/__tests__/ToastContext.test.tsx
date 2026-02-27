import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast, ToastProvider } from '../ToastContext'

// ✅ Wrapper com ToastProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call success method', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const successSpy = vi.spyOn(result.current, 'success')

    act(() => {
      result.current.success('Success message')
    })

    expect(successSpy).toHaveBeenCalledWith('Success message')
  })

  it('should call error method', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const errorSpy = vi.spyOn(result.current, 'error')

    act(() => {
      result.current.error('Error message')
    })

    expect(errorSpy).toHaveBeenCalledWith('Error message')
  })

  it('should call info method', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const infoSpy = vi.spyOn(result.current, 'info')

    act(() => {
      result.current.info('Info message')
    })

    expect(infoSpy).toHaveBeenCalledWith('Info message')
  })

  it('should call warning method', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const warningSpy = vi.spyOn(result.current, 'warning')

    act(() => {
      result.current.warning('Warning message')
    })

    expect(warningSpy).toHaveBeenCalledWith('Warning message')
  })

  it('should call clear method', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const clearSpy = vi.spyOn(result.current, 'clear')

    act(() => {
      result.current.clear()
    })

    expect(clearSpy).toHaveBeenCalled()
  })

  it('should handle custom duration', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const infoSpy = vi.spyOn(result.current, 'info')

    act(() => {
      result.current.info('Custom duration', 3000)
    })

    expect(infoSpy).toHaveBeenCalledWith('Custom duration', 3000)
  })

  it('should handle multiple toast calls', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    const spies = {
      success: vi.spyOn(result.current, 'success'),
      error: vi.spyOn(result.current, 'error'),
      info: vi.spyOn(result.current, 'info')
    }

    act(() => {
      result.current.success('Success')
      result.current.error('Error')
      result.current.info('Info')
    })

    expect(spies.success).toHaveBeenCalledTimes(1)
    expect(spies.error).toHaveBeenCalledTimes(1)
    expect(spies.info).toHaveBeenCalledTimes(1)
  })
})