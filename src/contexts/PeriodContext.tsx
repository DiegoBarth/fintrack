import { createContext, useState, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

/**
 * Context Interface - defines all globally accessible values
 *
 * Responsibilities:
 * - Selected period state (month/year)
 * - Methods to change the period
 */
interface PeriodContextType {
  // ===== Period State =====
  month: string                      // Month in "1"-"12" format
  setMonth: (month: string) => void  // Reactive setter
  year: number                       // Full year (2025)
  setYear: (year: number) => void    // Reactive setter
}

/**
 * Context
 *
 * Using null forces consumers to be inside the Provider,
 * preventing silent bugs.
 */
export const PeriodContext = createContext<PeriodContextType | null>(null)

/**
 * Retrieves the saved period from sessionStorage or returns the current month/year
 *
 * Benefit: Allows the user to return to the same period after a page refresh
 * sessionStorage is preferable to localStorage as it is cleared when the tab is closed
 *
 * @returns Object containing the initial month and year
 */
function getInitialPeriod() {
  const saved = sessionStorage.getItem('period')
  if (saved) return JSON.parse(saved)

  const today = new Date()
  return {
    month: String(today.getMonth() + 1),
    year: today.getFullYear()
  }
}

/**
 * Context Provider
 *
 * Responsibilities:
 * 1. Manages global period state (month/year)
 * 2. Persists period in sessionStorage
 *
 * Data Flow:
 * - User changes month/year
 * - useEffect detects the change
 * - sessionStorage is updated
 * - Subscribed components receive new value
 *
 * @example
 * <PeriodProvider>
 *   <App />
 * </PeriodProvider>
 */
export function PeriodProvider({ children }: { children: ReactNode }) {
  // ===== Retrieve Initial Period =====
  const initialPeriod = getInitialPeriod()

  // ===== Reactive State =====
  const [month, setMonth] = useState<string>(initialPeriod.month)
  const [year, setYear] = useState<number>(initialPeriod.year)

  // ===== Period Persistence =====
  useEffect(() => {
    sessionStorage.setItem(
      'period',
      JSON.stringify({ month, year })
    )
  }, [month, year])

  // ===== Memoized Context Value =====
  // Prevents unnecessary re-renders in consumers
  const value = useMemo(
    () => ({
      month,
      setMonth,
      year,
      setYear
    }),
    [month, year]
  )

  // ===== Provider Render =====
  return (
    <PeriodContext.Provider value={value}>
      {children}
    </PeriodContext.Provider>
  )
}

/**
 * Custom hook to consume PeriodContext
 *
 * Benefit: Automatic typing + runtime safety
 *
 * @example
 * const { month, setMonth } = usePeriod()
 *
 * @throws Error if used outside of PeriodProvider
 */
export const usePeriod = () => {
  const context = useContext(PeriodContext)

  if (!context) {
    throw new Error('usePeriod must be used within PeriodProvider')
  }

  return context
}