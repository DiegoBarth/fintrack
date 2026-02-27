import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PeriodProvider, usePeriod } from '../PeriodContext'

// 🔹 helper consumer para testar o contexto
function TestConsumer() {
  const { month, year, setMonth, setYear } = usePeriod()

  return (
    <div>
      <span data-testid="month">{month}</span>
      <span data-testid="year">{year}</span>
      <button onClick={() => setMonth('12')}>set-month</button>
      <button onClick={() => setYear(2030)}>set-year</button>
    </div>
  )
}

describe('PeriodContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('should use current date when sessionStorage is empty', () => {
    const today = new Date()
    const expectedMonth = String(today.getMonth() + 1)
    const expectedYear = String(today.getFullYear())

    render(
      <PeriodProvider>
        <TestConsumer />
      </PeriodProvider>
    )

    expect(screen.getByTestId('month')).toHaveTextContent(expectedMonth)
    expect(screen.getByTestId('year')).toHaveTextContent(expectedYear)
  })

  it('should load initial period from sessionStorage', () => {
    sessionStorage.setItem(
      'period',
      JSON.stringify({ month: '5', year: 2024 })
    )

    render(
      <PeriodProvider>
        <TestConsumer />
      </PeriodProvider>
    )

    expect(screen.getByTestId('month')).toHaveTextContent('5')
    expect(screen.getByTestId('year')).toHaveTextContent('2024')
  })

  it('should update month and persist to sessionStorage', async () => {
    const user = userEvent.setup()

    render(
      <PeriodProvider>
        <TestConsumer />
      </PeriodProvider>
    )

    await user.click(screen.getByText('set-month'))

    expect(screen.getByTestId('month')).toHaveTextContent('12')

    const saved = JSON.parse(sessionStorage.getItem('period')!)
    expect(saved.month).toBe('12')
  })

  it('should update year and persist to sessionStorage', async () => {
    const user = userEvent.setup()

    render(
      <PeriodProvider>
        <TestConsumer />
      </PeriodProvider>
    )

    await user.click(screen.getByText('set-year'))

    expect(screen.getByTestId('year')).toHaveTextContent('2030')

    const saved = JSON.parse(sessionStorage.getItem('period')!)
    expect(saved.year).toBe(2030)
  })

  it('should throw error when usePeriod is used outside provider', () => {
    // silencia erro esperado no console
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { })

    const BrokenConsumer = () => {
      usePeriod()
      return null
    }

    expect(() => render(<BrokenConsumer />)).toThrow(
      'usePeriod must be used within PeriodProvider'
    )

    spy.mockRestore()
  })

  it('should update sessionStorage when month or year changes', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.spyOn(sessionStorage.__proto__, 'setItem')

    render(
      <PeriodProvider>
        <TestConsumer />
      </PeriodProvider>
    )

    await user.click(screen.getByText('set-month'))
    await user.click(screen.getByText('set-year'))

    expect(setItemSpy).toHaveBeenCalled()
  })
})