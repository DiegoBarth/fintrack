import { QuickActions } from "@/components/home/QuickActions"
import { Alerts } from "@/components/home/Alerts"
import { MonthlySummary } from "@/components/home/MonthlySummary"
import { Layout } from '@/components/layout/Layout'

interface Props {
   onLogout: () => void
}

export function Home({ onLogout }: Props) {
   return (
      <Layout
         title="Home"
         onLogout={onLogout}
         showPeriodoFilters
         containerClassName="max-w-4xl"
      >
         <section className="mb-4">
            <Alerts />
         </section>

         <section className="mb-6">
            <MonthlySummary />
         </section>

         <section className="sticky bottom-0 bg-white">
            <QuickActions />
         </section>
      </Layout>
   )
}