import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../ThemeContext'

class LocalStorageMock {
  store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
})

// 🔹 consumer helper
function TestConsumer() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')

    // remove meta se existir
    document
      .querySelector('meta[name="theme-color"]')
      ?.remove()

    vi.restoreAllMocks()
  })

  function addMetaTheme() {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
    return meta
  }

  it('should default to light theme when no localStorage value', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('should load theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should toggle theme from light to dark', async () => {
    const user = userEvent.setup()
    const meta = addMetaTheme()

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await user.click(screen.getByText('toggle'))

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(meta.getAttribute('content')).toBe('#111827')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('should toggle theme from dark to light', async () => {
    const user = userEvent.setup()
    const meta = addMetaTheme()

    localStorage.setItem('theme', 'dark')

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await user.click(screen.getByText('toggle'))

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(meta.getAttribute('content')).toBe('#ef4444')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('should not crash if meta theme-color does not exist', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await user.click(screen.getByText('toggle'))

    expect(screen.getByTestId('theme')).toBeInTheDocument()
  })

  it('should throw error when useTheme is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { })

    const Broken = () => {
      useTheme()
      return null
    }

    expect(() => render(<Broken />)).toThrow(
      'useTheme must be used within ThemeProvider'
    )

    spy.mockRestore()
  })
})