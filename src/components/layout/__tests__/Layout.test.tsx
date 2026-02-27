import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Layout } from '@/components/layout/Layout'
import { PeriodContext } from '@/contexts/PeriodContext'

// Mock PeriodFilters to avoid heavy rendering and improve coverage clarity
vi.mock('@/components/home/PeriodFilters', () => ({
  PeriodFilters: (props: any) => (
    <div data-testid="period-filters">
      filters-{props.month}-{props.year}
    </div>
  ),
}))

// Mock requestAnimationFrame for deterministic tests
beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(0)
    return 1
  })

  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { })
})

// Helper to render with PeriodContext
function renderWithPeriod(ui: React.ReactNode) {
  const setMonth = vi.fn()
  const setYear = vi.fn()

  return {
    setMonth,
    setYear,
    ...render(
      <PeriodContext.Provider
        value={{
          month: '1',
          year: 2024,
          setMonth,
          setYear,
        }}
      >
        {ui}
      </PeriodContext.Provider>
    ),
  }
}

describe('Layout', () => {
  it('should render title and children', () => {
    renderWithPeriod(
      <Layout title="My Title">
        <div>content</div>
      </Layout>
    )

    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('should render back button when onBack is provided', () => {
    const onBack = vi.fn()

    renderWithPeriod(
      <Layout title="Title" onBack={onBack}>
        <div />
      </Layout>
    )

    const btn = screen.getByRole('button', { name: /voltar/i })
    fireEvent.click(btn)

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('should render logout button when onLogout is provided', () => {
    const onLogout = vi.fn()

    renderWithPeriod(
      <Layout title="Title" onLogout={onLogout}>
        <div />
      </Layout>
    )

    const btn = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(btn)

    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('should render subtitle when provided', () => {
    renderWithPeriod(
      <Layout title="Title" subtitle="Sub line">
        <div />
      </Layout>
    )

    expect(screen.getByText('Sub line')).toBeInTheDocument()
  })

  it('should render headerSlot content', () => {
    renderWithPeriod(
      <Layout title="Title" headerSlot={<div>slot</div>}>
        <div />
      </Layout>
    )

    expect(screen.getByText('slot')).toBeInTheDocument()
  })

  it('should apply colored header when variant is provided', () => {
    renderWithPeriod(
      <Layout title="Title" headerVariant="income">
        <div />
      </Layout>
    )

    // We assert by checking presence of header height class
    const header = screen.getByRole('heading').closest('header')
    expect(header?.className).toContain('h-[150px]')
  })

  describe('Period filters', () => {
    it('should render skeleton before filters appear', () => {
      // Force RAF to NOT run automatically
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)

      renderWithPeriod(
        <Layout title="Title" showPeriodoFilters>
          <div />
        </Layout>
      )

      // Skeleton placeholder
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render PeriodFilters after animation frame', async () => {
      renderWithPeriod(
        <Layout title="Title" showPeriodoFilters>
          <div />
        </Layout>
      )

      expect(await screen.findByTestId('period-filters')).toBeInTheDocument()
    })
  })

  it('should pass month and year to PeriodFilters', async () => {
    renderWithPeriod(
      <Layout title="Title" showPeriodoFilters>
        <div />
      </Layout>
    )

    expect(await screen.findByText('filters-1-2024')).toBeInTheDocument()
  })

  it('should render back button with colored header styles when headerVariant is provided', () => {
    const onBack = vi.fn()

    renderWithPeriod(
      <Layout
        title="Title"
        onBack={onBack}
        headerVariant="income"
      >
        <div />
      </Layout>
    )

    const backButton = screen.getByRole('button', { name: /voltar/i })

    // ensure colored header styles are applied
    expect(backButton.className).toContain('border-gray-600/40')
  })

  it('should render back button with default styles when headerVariant is not provided', () => {
    const onBack = vi.fn()

    renderWithPeriod(
      <Layout title="Title" onBack={onBack}>
        <div />
      </Layout>
    )

    const backButton = screen.getByRole('button', { name: /voltar/i })

    // ensure default styles are applied
    expect(backButton.className).toContain('border-gray-300')
  })

  it('should apply colored subtitle styles when headerVariant is provided', () => {
    renderWithPeriod(
      <Layout
        title="Title"
        subtitle="Period info"
        headerVariant="income"
      >
        <div />
      </Layout>
    )

    const subtitle = screen.getByText('Period info')

    // ensures TRUE branch of hasColoredHeader subtitle styles
    expect(subtitle).toHaveClass('text-gray-700')
  })
})