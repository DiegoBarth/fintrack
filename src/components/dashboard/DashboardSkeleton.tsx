import { Skeleton } from '@/components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-4">
      <div className="rounded-xl border border-zinc-100 dark:border-gray-700 p-6 space-y-6 h-[254px]">
        <Skeleton className="h-5 w-44" />
        <div className="space-y-4 flex flex-col justify-between h-40">
          <div className="space-y-2">
            <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-32" /></div>
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-32" /></div>
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-24 ml-2" />
        <div className="relative flex justify-center items-center h-[380px] overflow-hidden">
          <Skeleton className="h-[320px] w-72 rounded-xl z-20 shadow-lg" />
          <Skeleton className="absolute right-[-10%] h-[260px] w-72 rounded-xl opacity-40 scale-90" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-100 dark:border-gray-700 p-4 h-[350px] space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[90%] w-full rounded-md" />
        </div>

        <div className="rounded-xl border border-zinc-100 dark:border-gray-700 p-4 h-[350px] space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}