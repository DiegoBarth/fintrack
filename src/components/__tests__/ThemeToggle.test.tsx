import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeToggle, getThemeFromDOM } from '../ThemeToggle'
import { ThemeContext } from '@/contexts/ThemeContext'

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

// Mock icons to avoid noise in coverage
vi.mock('lucide-react', () => ({
  Moon: () => <svg data-testid="moon-icon" />,
  Sun: () => <svg data-testid="sun-icon" />
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // =============================
  // ✅ Without context (fallback)
  // =============================
  it('should render moon icon when theme is light (no context)', () => {
    render(<ThemeToggle />)

    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
  })

  it('should toggle theme using DOM when no context is provided', () => {
    render(<ThemeToggle />)

    const btn = screen.getByRole('button', { name: /alternar tema/i })

    fireEvent.click(btn)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('should switch back to light when clicked twice (no context)', () => {
    render(<ThemeToggle />)

    const btn = screen.getByRole('button', { name: /alternar tema/i })

    fireEvent.click(btn)
    fireEvent.click(btn)

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  // =============================
  // ✅ With context
  // =============================
  it('should call toggleTheme when context is provided', () => {
    const toggleTheme = vi.fn()

    render(
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>
    )

    const btn = screen.getByRole('button', { name: /alternar tema/i })

    fireEvent.click(btn)

    expect(toggleTheme).toHaveBeenCalledTimes(1)
  })

  it('should render sun icon when theme is dark from context', () => {
    render(
      <ThemeContext.Provider
        value={{ theme: 'dark', toggleTheme: vi.fn() }}
      >
        <ThemeToggle />
      </ThemeContext.Provider>
    )

    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
  })

  // =============================
  // ✅ Accessibility / event behavior
  // =============================
  it('should prevent default and stop propagation on click', () => {
    const toggleTheme = vi.fn()

    render(
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>
    )

    const btn = screen.getByRole('button')

    const preventSpy = vi.spyOn(Event.prototype, 'preventDefault')
    const stopSpy = vi.spyOn(Event.prototype, 'stopPropagation')

    fireEvent.click(btn)

    expect(preventSpy).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()
  })

  describe('getThemeFromDOM', () => {
    it('should return light when document is undefined (SSR safety)', () => {
      const originalDocument = global.document

      try {
        // Intentionally remove document to simulate SSR environment
        // @ts-expect-error intentional for SSR simulation
        delete global.document

        expect(getThemeFromDOM()).toBe('light')
      } finally {
        // Always restore document to avoid leaking state between tests
        global.document = originalDocument
      }
    })
  })
})