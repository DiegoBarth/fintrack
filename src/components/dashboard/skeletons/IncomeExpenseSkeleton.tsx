import { Skeleton } from '@/components/ui/Skeleton'

export function IncomeExpenseSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm p-6 space-y-6 h-[254px]">
      <Skeleton className="h-5 w-44" />

      <div className="space-y-4 flex flex-col justify-between h-40">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2 text-red-600">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}