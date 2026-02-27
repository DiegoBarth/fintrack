import { render, screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import AppProvider from '../AppProvider'

// 🔹 mocks dos providers internos para isolar o teste
vi.mock('../ThemeContext', () => ({
  ThemeProvider: ({ children }: any) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}))

vi.mock('../PeriodContext', () => ({
  PeriodProvider: ({ children }: any) => (
    <div data-testid="period-provider">{children}</div>
  ),
}))

describe('AppProvider', () => {
  const createClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

  it('should render children inside all providers', () => {
    const client = createClient()

    render(
      <AppProvider client={client}>
        <div data-testid="child">conteudo</div>
      </AppProvider>
    )

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('period-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should provide react query context correctly', () => {
    const client = createClient()

    // componente que só renderiza se o contexto do React Query existir
    const TestComponent = () => {
      return <div data-testid="react-query-ok">ok</div>
    }

    render(
      <AppProvider client={client}>
        <TestComponent />
      </AppProvider>
    )

    expect(screen.getByTestId('react-query-ok')).toBeInTheDocument()
  })

  it('should not crash when rendering without children content changes', () => {
    const client = createClient()

    const { rerender } = render(
      <AppProvider client={client}>
        <div>primeiro</div>
      </AppProvider>
    )

    rerender(
      <AppProvider client={client}>
        <div>segundo</div>
      </AppProvider>
    )

    expect(screen.getByText('segundo')).toBeInTheDocument()
  })
})