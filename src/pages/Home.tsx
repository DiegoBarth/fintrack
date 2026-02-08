import { useEffect } from 'react';
import { PeriodFilters } from "../components/home/PeriodFilters";
import { Alerts } from "../components/home/Alerts";
import { MonthlySummary } from "../components/home/MonthlySummary";
import { QuickActions } from '../components/home/QuickActions';
import { usePeriod } from '../contexts/PeriodContext';
import { fetchFullSummary } from '../api/home';

/**
 * Main Dashboard Home Page.
 * Orchestrates global filters, alerts, financial summaries, and quick action shortcuts.
 */
export function Home() {
   const { month, setMonth, year, setYear } = usePeriod();

   /**
    * Preloads or refreshes data whenever the selected period changes.
    */
   useEffect(() => {
      async function preloadData() {
         try {
            await fetchFullSummary(month, String(year));
         } catch (error) {
            console.error("Failed to sync home data:", error);
         }
      }
      preloadData();
   }, [month, year]);

   return (
      <div className="min-h-screen bg-background">
         <div className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl lg:max-w-4xl">

            {/* Control Header */}
            <header className="mb-6">
               <h1 className="mb-4 text-2xl font-bold text-foreground">Início</h1>
               <PeriodFilters
                  month={month}
                  year={year}
                  onMonthChange={setMonth}
                  onYearChange={setYear}
               />
            </header>

            {/* Critical Alerts (Today/Week) */}
            <section className="mb-6">
               <Alerts />
            </section>

            {/* Financial Metrics Cards */}
            <section className="mb-6">
               <MonthlySummary />
            </section>

            {/* Quick Access to Forms/Modules */}
            <section>
               <QuickActions />
            </section>
         </div>
      </div>
   )
}