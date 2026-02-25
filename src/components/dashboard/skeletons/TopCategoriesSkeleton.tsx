import { Skeleton } from '@/components/ui/Skeleton'

export function TopCategoriesSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
        p-6 shadow-sm h-full flex flex-col animate-[fadeUp_.4s_ease-out_forwards]
      "
    >
      <Skeleton className="h-7 w-40 mb-6" />

      <div className="space-y-4 flex-1">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}