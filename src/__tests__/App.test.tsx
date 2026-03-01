import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AUTH_TIMEOUT_MS, AUTH_REFRESH_INTERVAL_MS } from '@/config/constants'
import { verifyEmailAuthorization } from '@/api/endpoints/home'
import App from '@/App'

const mockedVerifyEmail = vi.mocked(verifyEmailAuthorization)

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  clear: vi.fn(),
}

vi.mock('@/contexts/toast', () => ({
  useToast: () => mockToast,
}))

vi.mock('@/api/endpoints/home', () => ({
  verifyEmailAuthorization: vi.fn(),
}))

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}))

vi.mock('@/contexts/AppProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
}))

vi.mock('@/AppRouter', () => ({
  default: ({ onLogout }: { onLogout: () => void }) => (
    <div data-testid="app-router">
      <button onClick={onLogout} data-testid="logout-btn">Sair</button>
    </div>
  ),
}))

vi.mock('@/components/PWAUpdatePrompt', () => ({
  default: () => null,
}))

vi.mock('@/components/login/LoginScreen', () => {
  const React = require('react')
  const createMockJWT = (email: string) => {
    const payload = btoa(JSON.stringify({ email }))
    return `header.${payload}.signature`
  }
  return {
    default: ({ onSuccess }: { onSuccess: (cred: any) => void }) => (
      <div data-testid="login-screen">
        <button
          data-testid="login-success"
          onClick={() => onSuccess({ credential: createMockJWT('test@example.com') })}
        >
          Login
        </button>
        <button data-testid="login-no-cred" onClick={() => onSuccess({})}>
          No credential
        </button>
        <button
          data-testid="login-invalid-jwt"
          onClick={() => onSuccess({ credential: 'header.invalid!!!.sig' })}
        >
          Invalid JWT
        </button>
      </div>
    ),
  }
})

type StorageMock = {
  getItem: ReturnType<typeof vi.fn<(key: string) => string | null>>
  setItem: ReturnType<typeof vi.fn<(key: string, value: string) => void>>
  removeItem: ReturnType<typeof vi.fn<(key: string) => void>>
  clear: ReturnType<typeof vi.fn<() => void>>
  length: number
  key: ReturnType<typeof vi.fn>
}

describe('App', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { store = {} }),
      get length() { return Object.keys(store).length },
      key: vi.fn(),
    } as StorageMock
  })()

  const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { store = {} }),
      get length() { return Object.keys(store).length },
      key: vi.fn(),
    } as StorageMock
  })()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true })
    localStorageMock.getItem.mockReturnValue('')
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
    sessionStorageMock.removeItem.mockImplementation(() => {})
    if ('google' in window) delete (window as any).google
  })

  it('renders LoginScreen when user is not logged in', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    render(<App />)

    expect(await screen.findByTestId('login-screen', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('renders main app when user has valid session in localStorage', () => {
    const now = Date.now()
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'user_email' ? 'user@test.com' : key === 'login_time' ? String(now) : null
    )

    render(<App />)

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    expect(screen.getByTestId('app-provider')).toBeInTheDocument()
    expect(screen.getByTestId('app-router')).toBeInTheDocument()
  })

  it('clears expired session and shows LoginScreen', async () => {
    const expiredTime = Date.now() - AUTH_TIMEOUT_MS - 1000
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'user_email' ? 'user@test.com' : key === 'login_time' ? String(expiredTime) : null
    )

    render(<App />)

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('login_time')
    expect(await screen.findByTestId('login-screen', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('calls handleLoginSuccess and shows app when email is authorized', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockedVerifyEmail.mockResolvedValue(true)

    render(<App />)

    const loginBtn = await screen.findByTestId('login-success', {}, { timeout: 3000 })
    fireEvent.click(loginBtn)

    await waitFor(() => {
      expect(mockedVerifyEmail).toHaveBeenCalledWith('test@example.com')
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('user_email', 'test@example.com')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('login_time', expect.any(String))

    await waitFor(() => {
      expect(screen.getByTestId('app-router')).toBeInTheDocument()
    })
  })

  it('shows toast error when email is not authorized', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    mockedVerifyEmail.mockResolvedValue(false)

    render(<App />)

    const loginBtn = await screen.findByTestId('login-success', {}, { timeout: 3000 })
    fireEvent.click(loginBtn)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('E-mail não autorizado!')
    })
  })

  it('shows toast error when login fails with invalid credential', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorageMock.getItem.mockReturnValue(null as string | null)

    render(<App />)

    const invalidBtn = await screen.findByTestId('login-invalid-jwt', {}, { timeout: 3000 })
    fireEvent.click(invalidBtn)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro ao fazer login')
    })

    consoleSpy.mockRestore()
  })

  it('does nothing when credential is missing', async () => {
    localStorageMock.getItem.mockReturnValue(null as string | null)

    render(<App />)

    const noCredBtn = await screen.findByTestId('login-no-cred', {}, { timeout: 3000 })
    fireEvent.click(noCredBtn)

    await waitFor(() => {
      expect(mockedVerifyEmail).not.toHaveBeenCalled()
    })
  })

  it('refreshes login_time in localStorage at interval when user is logged in', async () => {
    vi.useFakeTimers()
    const now = Date.now()
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'user_email' ? 'user@test.com' : key === 'login_time' ? String(now) : null
    )

    render(<App />)

    expect(screen.getByTestId('app-router')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(AUTH_REFRESH_INTERVAL_MS)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('login_time', expect.any(String))

    vi.useRealTimers()
  })

  it('calls handleLogout and shows LoginScreen', async () => {
    const now = Date.now()
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'user_email' ? 'user@test.com' : key === 'login_time' ? String(now) : null
    )

    const disableAutoSelect = vi.fn()
    Object.defineProperty(window, 'google', {
      value: { accounts: { id: { disableAutoSelect } } },
      writable: true,
    })

    render(<App />)

    expect(screen.getByTestId('app-router')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('login_time')
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('period')
      expect(mockToast.info).toHaveBeenCalledWith('Você foi desconectado')
    })

    expect(await screen.findByTestId('login-screen', {}, { timeout: 3000 })).toBeInTheDocument()

    expect(disableAutoSelect).toHaveBeenCalled()
  })
})
