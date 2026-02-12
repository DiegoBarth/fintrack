import { QuickActions } from "@/components/home/QuickActions"
import { Alerts } from "@/components/home/Alerts"
import { MonthlySummary } from "@/components/home/MonthlySummary"
import { Layout } from '@/components/layout/Layout'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Props {
   onLogout: () => void
}

export function Home({ onLogout }: Props) {
   return (
      <Layout
         title="Home"
         onLogout={onLogout}
         showPeriodoFilters
         headerSlot={<ThemeToggle />}
         containerClassName="max-w-4xl"
      >
         <div className="pb-20">
            {/* Alerts */}
            <section className="mb-4">
               <Alerts />
            </section>
            <div className="border-t border-gray-200 my-4"></div>

            <section>
               <MonthlySummary />
            </section>
         </div>
         <section className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto px-4">
               <QuickActions />
            </div>
         </section>
      </Layout>
   )
}