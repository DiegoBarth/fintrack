import { type ReactNode } from 'react'

import { PeriodFilters } from '@/components/home/PeriodFilters'
import { usePeriod } from '@/contexts/PeriodContext'

interface LayoutProps {
   title: string
   children: ReactNode
   onBack?: () => void
   onLogout?: () => void
   showPeriodoFilters?: boolean
   headerSlot?: ReactNode
   containerClassName?: string
   contentClassName?: string
}

export function Layout({
   title,
   children,
   onBack,
   onLogout,
   showPeriodoFilters = false,
   headerSlot,
   containerClassName = 'max-w-5xl',
   contentClassName = '',
}: LayoutProps) {
   const { month, setMonth, year, setYear, isLoading } = usePeriod()

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
         <div className={`mx-auto ${containerClassName} px-4 py-6`}>
            <header className="mb-6 space-y-4">
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-2">
                     {onBack ? (
                        <button
                           className="w-fit rounded-md border border-gray-300 dark:border-gray-600 px-3
                              py-1 text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 hover:shadow-sm group"
                           onClick={onBack}
                        >
                           <span className="group-hover:font-medium text-gray-700 dark:text-gray-300">← Voltar</span>
                        </button>
                     ) : null}

                     <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                  </div>

                  <div className="flex items-center gap-3">
                     {headerSlot}
                     {onLogout ? (
                        <button
                           onClick={onLogout}
                           className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm
                              text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700
                              dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:scale-105 hover:shadow-sm group"
                        >
                           <span className="group-hover:font-medium">Logout</span>
                        </button>
                     ) : null}
                  </div>
               </div>

               {showPeriodoFilters ? (
                  <PeriodFilters
                     month={month}
                     year={year}
                     onMonthChange={setMonth}
                     onYearChange={setYear}
                     isLoading={isLoading}
                  />
               ) : null}
            </header>

            <main className={contentClassName}>{children}</main>
         </div>
      </div>
   )
}