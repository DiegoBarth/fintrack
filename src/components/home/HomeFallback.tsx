import { Layout } from '@/components/layout/Layout'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Skeleton } from '@/components/ui/Skeleton'

const SUMMARY_CARD_COLORS = ['#3b82f6', '#ef4444', '#b45309', '#6366f1', '#15803d'] as const

function SummaryCardSkeleton({ color }: { color: string }) {
  return (
    <div
      className="h-[78px] animate-summary-card flex items-center justify-between rounded-xl
        bg-white dark:bg-gray-800 p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700"
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div
          className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded" />
        </div>
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-3.5 w-20 md:w-24 rounded-md" />
          <Skeleton className="h-7 md:h-8 w-28 md:w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function QuickActionsSkeleton() {
  return (
    <div className="py-1 px-6 h-32 bg-white dark:bg-gray-800 rounded-lg">
      <Skeleton className="h-4 w-24 rounded-md mb-3" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <Skeleton className="h-3 w-14 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface HomeFallbackProps {
  onLogout?: () => void
}

export function HomeFallback({ onLogout }: HomeFallbackProps) {
  return (
    <Layout
      title="Home"
      showPeriodoFilters
      onLogout={onLogout}
      headerSlot={<ThemeToggle />}
      containerClassName="max-w-4xl"
    >
      <div className="pb-20">
        <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
        <section>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Resumo do Mês
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUMMARY_CARD_COLORS.map((color) => (
              <SummaryCardSkeleton key={color} color={color} />
            ))}
          </div>
        </section>
      </div>
      <section className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <QuickActionsSkeleton />
        </div>
      </section>
    </Layout>
  )
}
