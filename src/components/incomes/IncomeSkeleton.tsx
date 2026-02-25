import { Skeleton } from "@/components/ui/Skeleton"

export function IncomeSkeleton() {
  return (
    <div className="pt-1 max-w-7xl mx-auto w-full">
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i}>
            <div className="md:hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3 shadow-sm h-[94px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-32 opacity-70" />
                  <Skeleton className="h-3 w-28 opacity-70" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 items-center rounded-lg
                    border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-4 h-[64px] shadow-sm">
              <div className="col-span-5">
                <Skeleton className="h-5 w-52" />
              </div>

              <div className="col-span-3">
                <Skeleton className="h-4 w-40 opacity-70" />
              </div>

              <div className="col-span-2 text-right">
                <Skeleton className="h-5 w-24 ml-auto" />
              </div>

              <div className="col-span-2 flex justify-end">
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}