import { PeriodFilters } from "@/components/home/PeriodFilters";
import { Alerts } from "@/components/home/Alerts";
import { MonthlySummary } from "@/components/home/MonthlySummary";
import { QuickActions } from '@/components/home/QuickActions';
import { usePeriod } from '@/contexts/PeriodContext';

interface Props {
   onLogout: () => void
}

/**
 * Main Home Page.
 * Orchestrates global filters, alerts, financial summaries, and quick action shortcuts.
 */
export function Home({ onLogout }: Props) {
   const { month, setMonth, year, setYear, isLoading } = usePeriod();

   return (
      <div className="min-h-screen bg-background">
         <div className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl lg:max-w-4xl">

            {/* Control Header */}
            <header className="mb-4">
               <h1 className="mb-4 text-2xl font-bold text-foreground">Início</h1>
               <PeriodFilters
                  month={month}
                  year={year}
                  onMonthChange={setMonth}
                  onYearChange={setYear}
                  isLoading={isLoading}
               />

               <button
                  onClick={onLogout}
                  className=" fixed top-7 right-4 text-sm text-gray-600 hover:text-red-800 border px-2 py-1 rounded-md transition-colors">
                  Logout
               </button>
            </header>

            {/* Critical Alerts (Today/Week) */}
            <section className="mb-4">
               <Alerts />
            </section>

            {/* Financial Metrics Cards */}
            <section className="mb-6">
               <MonthlySummary />
            </section>

            {/* Quick Access to Forms/Modules */}
            <section className="sticky bottom-0 bg-white">
               <QuickActions />
            </section>
         </div>
      </div>
   )
}