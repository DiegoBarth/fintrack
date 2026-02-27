import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'
import { fireEvent } from '@testing-library/react'

const ThrowError = () => {
  throw new Error('Erro de teste')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { })
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Conteúdo OK</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Conteúdo OK')).toBeInTheDocument()
  })

  it('should render fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
  })

  it('should reload page when button is clicked', () => {
    // Mock window.location safely
    const reloadMock = vi.fn()

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        reload: reloadMock,
      },
    })

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    fireEvent.click(
      screen.getByRole('button', { name: /recarregar página/i })
    )

    expect(reloadMock).toHaveBeenCalled()
  })
})