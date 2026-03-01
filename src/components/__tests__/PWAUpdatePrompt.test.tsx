import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRegisterSW } from 'virtual:pwa-register/react'
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt'

const setNeedRefresh = vi.fn()
const updateServiceWorker = vi.fn()

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn((config: {
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: unknown) => void
  }) => {
    return {
      needRefresh: [true, setNeedRefresh],
      updateServiceWorker,
    }
  }),
}))

describe('PWAUpdatePrompt', () => {
  const originalDev = import.meta.env.DEV
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let setIntervalSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRegisterSW).mockImplementation(() => ({
      needRefresh: [true, setNeedRefresh],
      updateServiceWorker,
    } as never))
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setIntervalSpy = vi.spyOn(global, 'setInterval').mockImplementation(() => 0 as unknown as ReturnType<typeof setInterval>)
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    setIntervalSpy.mockRestore()
    vi.stubEnv('DEV', originalDev)
  })

  it('returns null when needRefresh is false', () => {
    vi.mocked(useRegisterSW).mockReturnValue({
      needRefresh: [false, setNeedRefresh],
      updateServiceWorker,
    } as never)

    const { container } = render(<PWAUpdatePrompt />)

    expect(container.firstChild).toBeNull()
  })

  it('renders banner when needRefresh is true', () => {
    render(<PWAUpdatePrompt />)

    expect(screen.getByText('Nova versão disponível!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /depois/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })

  it('calls setNeedRefresh(false) when "Depois" is clicked', () => {
    render(<PWAUpdatePrompt />)

    fireEvent.click(screen.getByRole('button', { name: /depois/i }))

    expect(setNeedRefresh).toHaveBeenCalledWith(false)
  })

  it('calls updateServiceWorker(true) when "Atualizar" is clicked', () => {
    render(<PWAUpdatePrompt />)

    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }))

    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('calls console.log when onRegistered runs in DEV mode', () => {
    vi.stubEnv('DEV', true)

    const mockRegistration = { scope: 'https://example.com/' } as ServiceWorkerRegistration
    vi.mocked(useRegisterSW).mockImplementation((config: any) => {
      config.onRegistered?.(mockRegistration)
      return {
        needRefresh: [false, setNeedRefresh],
        updateServiceWorker,
      } as never
    })

    render(<PWAUpdatePrompt />)

    expect(consoleLogSpy).toHaveBeenCalledWith('SW registered (dev):', 'https://example.com/')
  })

  it('sets interval for update check when onRegistered runs in production with registration', () => {
    vi.stubEnv('DEV', false)

    const mockUpdate = vi.fn()
    const mockRegistration = { update: mockUpdate, scope: '/' } as unknown as ServiceWorkerRegistration
    vi.mocked(useRegisterSW).mockImplementation((config: any) => {
      config.onRegistered?.(mockRegistration)
      return {
        needRefresh: [false, setNeedRefresh],
        updateServiceWorker,
      } as never
    })

    render(<PWAUpdatePrompt />)

    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    expect(setIntervalSpy.mock.calls[0][1]).toBe(60 * 60 * 1000)
    const callback = setIntervalSpy.mock.calls[0][0] as () => void
    callback()
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('does not set interval when onRegistered runs in production with null registration', () => {
    vi.stubEnv('DEV', false)

    vi.mocked(useRegisterSW).mockImplementation((config: any) => {
      config.onRegistered?.(null)
      return {
        needRefresh: [false, setNeedRefresh],
        updateServiceWorker,
      } as never
    })

    render(<PWAUpdatePrompt />)

    expect(setIntervalSpy).not.toHaveBeenCalled()
  })

  it('calls console.warn when onRegisterError runs', () => {
    const mockError = new Error('SW registration failed')
    vi.mocked(useRegisterSW).mockImplementation((config: any) => {
      config.onRegisterError?.(mockError)
      return {
        needRefresh: [false, setNeedRefresh],
        updateServiceWorker,
      } as never
    })

    render(<PWAUpdatePrompt />)

    expect(consoleWarnSpy).toHaveBeenCalledWith('SW registration error:', mockError)
  })
})
