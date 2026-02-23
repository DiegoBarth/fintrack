import { lazy, Suspense } from "react"
import { Layout } from '@/components/layout/Layout'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Skeleton } from "@/components/ui/Skeleton"

const QuickActions = lazy(() => import('@/components/home/QuickActions'))
const Alerts = lazy(() => import('@/components/home/Alerts'))
const MonthlySummary = lazy(() => import('@/components/home/MonthlySummary'))

interface Props {
   onLogout: () => void
}

export default function Home({ onLogout }: Props) {
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
               <Suspense fallback={<Skeleton className="h-20 w-full rounded-md" />}>
                  <Alerts />
               </Suspense>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            <section>
               <Suspense fallback={<Skeleton className="h-72 w-full rounded-md" />}>
                  <MonthlySummary />
               </Suspense>
            </section>
         </div>

         <section className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
            <div className="max-w-4xl mx-auto px-4">
               <Suspense fallback={<Skeleton className="h-20 w-full rounded-md" />}>
                  <QuickActions />
               </Suspense>
            </div>
         </section>
      </Layout>
   )
}
