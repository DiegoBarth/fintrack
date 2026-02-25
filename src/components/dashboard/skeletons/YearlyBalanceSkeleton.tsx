import { Skeleton } from '@/components/ui/Skeleton'

export function YearlyBalanceSkeleton() {
  return (
    <div
      className="h-[459px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
        p-4 md:p-6 shadow-sm h-full flex flex-col animate-[fadeUp_.4s_ease-out_forwards]
      "
    >
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-6 w-48" />
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[280px] relative px-2">
        <div className="absolute left-0 h-full flex flex-col justify-between py-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-2 w-8 opacity-30" />
          ))}
        </div>
        
        <Skeleton className="h-full rounded-lg ml-10 w-[calc(100%-60px)]" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-24 bg-emerald-50 dark:bg-emerald-900/20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-24 bg-red-50 dark:bg-red-900/20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-24 bg-emerald-50 dark:bg-emerald-900/20" />
        </div>
      </div>
      
    </div>
  );
}