import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GoogleLoginButton from '@/components/login/GoogleLoginButton'

const mockOnSuccess = vi.fn()
const mockOnError = vi.fn()

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children, clientId }: { children: React.ReactNode; clientId: string }) => (
    <div data-testid="google-oauth-provider" data-client-id={clientId}>
      {children}
    </div>
  ),
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (response: { credential?: string }) => void
    onError: () => void
  }) => (
    <div data-testid="google-login">
      <button type="button" onClick={() => onSuccess({ credential: 'test-credential' })}>
        Sign in with Google
      </button>
      <button type="button" onClick={onError}>
        Sign in error
      </button>
    </div>
  ),
}))

vi.mock('@/config/constants', () => ({
  GOOGLE_CLIENT_ID: 'mock-client-id.apps.googleusercontent.com',
}))

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('after mount renders GoogleOAuthProvider and GoogleLogin', async () => {
    render(<GoogleLoginButton onSuccess={mockOnSuccess} onError={mockOnError} />)
    expect(await screen.findByTestId('google-oauth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('google-login')).toBeInTheDocument()
  })

  it('uses GOOGLE_CLIENT_ID in provider', async () => {
    render(<GoogleLoginButton onSuccess={mockOnSuccess} onError={mockOnError} />)
    const provider = await screen.findByTestId('google-oauth-provider')
    expect(provider).toHaveAttribute(
      'data-client-id',
      'mock-client-id.apps.googleusercontent.com'
    )
  })

  it('calls onSuccess with credential when sign in succeeds', async () => {
    render(<GoogleLoginButton onSuccess={mockOnSuccess} onError={mockOnError} />)
    const btn = await screen.findByRole('button', { name: 'Sign in with Google' })
    fireEvent.click(btn)
    expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    expect(mockOnSuccess).toHaveBeenCalledWith({ credential: 'test-credential' })
  })

  it('calls onError when sign in error button is clicked', async () => {
    render(<GoogleLoginButton onSuccess={mockOnSuccess} onError={mockOnError} />)
    const btn = await screen.findByRole('button', { name: 'Sign in error' })
    fireEvent.click(btn)
    expect(mockOnError).toHaveBeenCalledTimes(1)
  })
})
