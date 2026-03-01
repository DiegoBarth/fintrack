import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginScreen from '@/components/login/LoginScreen'

vi.mock('@/components/login/GoogleLoginButton', () => ({
  __esModule: true,
  default: ({ onSuccess, onError }: { onSuccess: (c: unknown) => void; onError: () => void }) => (
    <div data-testid="google-login-button">
      <button type="button" onClick={() => onSuccess({ credential: 'mock-token' })}>
        Login com Google
      </button>
      <button type="button" onClick={onError}>
        Erro
      </button>
    </div>
  ),
}))

describe('LoginScreen', () => {
  it('renders title Fintrack', () => {
    render(<LoginScreen onSuccess={vi.fn()} onError={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Fintrack' })).toBeInTheDocument()
  })

  it('renders subtitle about Google account', () => {
    render(<LoginScreen onSuccess={vi.fn()} onError={vi.fn()} />)
    expect(
      screen.getByText(/Acesse com sua conta Google para gerenciar seus dados/)
    ).toBeInTheDocument()
  })

  it('renders footer about authorized emails', () => {
    render(<LoginScreen onSuccess={vi.fn()} onError={vi.fn()} />)
    expect(screen.getByText(/Apenas e-mails autorizados terão acesso/)).toBeInTheDocument()
  })

  it('renders GoogleLoginButton after lazy load', async () => {
    render(<LoginScreen onSuccess={vi.fn()} onError={vi.fn()} />)
    const btn = await screen.findByTestId('google-login-button', {}, { timeout: 2000 })
    expect(btn).toBeInTheDocument()
  })

  it('passes onSuccess to GoogleLoginButton and it is called on success', async () => {
    const onSuccess = vi.fn()
    render(<LoginScreen onSuccess={onSuccess} onError={vi.fn()} />)
    const loginBtn = await screen.findByRole('button', { name: 'Login com Google' }, { timeout: 2000 })
    loginBtn.click()
    expect(onSuccess).toHaveBeenCalledWith({ credential: 'mock-token' })
  })

  it('passes onError to GoogleLoginButton and it is called on error', async () => {
    const onError = vi.fn()
    render(<LoginScreen onSuccess={vi.fn()} onError={onError} />)
    const errBtn = await screen.findByRole('button', { name: 'Erro' }, { timeout: 2000 })
    errBtn.click()
    expect(onError).toHaveBeenCalled()
  })

  it('renders container with centered layout and card styles', () => {
    const { container } = render(<LoginScreen onSuccess={vi.fn()} onError={vi.fn()} />)
    expect(container.querySelector('.min-h-screen.bg-slate-50')).toBeInTheDocument()
    expect(container.querySelector('.max-w-sm.bg-white.shadow-lg.rounded-xl')).toBeInTheDocument()
  })
})
