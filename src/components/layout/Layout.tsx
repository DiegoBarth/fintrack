import { type ReactNode } from 'react'

import { PeriodFilters } from '@/components/home/PeriodFilters'
import { InstallPWA } from '@/components/InstallPWA'
import { usePeriod } from '@/contexts/PeriodContext'

export type HeaderVariant = 'income' | 'expense' | 'commitment'

/** Gradientes: light mode = tons pastel que combinam com fundo claro; dark mode = mais saturados com transparência. */
const HEADER_GRADIENTS: Record<HeaderVariant, string> = {
   income:
      'bg-gradient-to-bl from-emerald-200 to-emerald-400/90 dark:from-emerald-400/80 dark:to-emerald-700/88',
   expense:
      'bg-gradient-to-bl from-red-100 to-red-300/90 dark:from-red-400/80 dark:to-red-700/88',
   commitment:
      'bg-gradient-to-bl from-amber-100 to-amber-300/90 dark:from-amber-400/80 dark:to-amber-600/88'
}

interface LayoutProps {
   title: string
   children: ReactNode
   onBack?: () => void
   onLogout?: () => void
   showPeriodoFilters?: boolean
   headerSlot?: ReactNode
   /** Optional line below the title (e.g. period and total). */
   subtitle?: ReactNode
   /** Colored gradient header matching the screen (income=green, expense=red, commitment=amber). */
   headerVariant?: HeaderVariant
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
   subtitle,
   headerVariant,
   containerClassName = 'max-w-5xl',
   contentClassName = '',
}: LayoutProps) {
   const { month, setMonth, year, setYear, isLoading } = usePeriod()

   const hasColoredHeader = !!headerVariant
   const headerBg = headerVariant ? HEADER_GRADIENTS[headerVariant] : ''

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
         <div className={`mx-auto ${containerClassName} px-4 ${hasColoredHeader ? 'pt-0 pb-6' : 'py-6'}`}>
            <header
               className={
                  hasColoredHeader
                     ? `mb-6 space-y-4 -mx-4 -mt-4 px-4 pt-6 pb-5 rounded-b-2xl ${headerBg} shadow-md`
                     : 'mb-6 space-y-4'
               }
            >
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-2">
                     {onBack ? (
                        <button
                           className={
                              hasColoredHeader
                                 ? 'w-fit rounded-md border border-gray-600/40 dark:border-white/40 px-3 py-1 text-sm transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/20 group text-gray-900 dark:text-white'
                                 : 'w-fit rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 hover:shadow-sm group'
                           }
                           onClick={onBack}
                        >
                           <span className={hasColoredHeader ? 'group-hover:font-medium' : 'group-hover:font-medium text-gray-700 dark:text-gray-300'}>
                              ← Voltar
                           </span>
                        </button>
                     ) : null}

                     <h1
                        className={
                           hasColoredHeader
                              ? 'text-2xl font-bold text-gray-900 dark:text-white'
                              : 'text-2xl font-bold text-gray-900 dark:text-gray-100'
                        }
                     >
                        {title}
                     </h1>
                     {subtitle ? (
                        <p
                           className={
                              hasColoredHeader
                                 ? 'text-sm text-gray-700 dark:text-white/90'
                                 : 'text-sm text-muted-foreground'
                           }
                        >
                           {subtitle}
                        </p>
                     ) : null}
                  </div>

                  <div className="flex items-center gap-3 ml-auto flex-shrink-0">
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
         <InstallPWA />
      </div>
   )
}