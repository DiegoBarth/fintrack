import { Skeleton } from "@/components/ui/Skeleton"

export function ExpenseSkeleton() {
   return (
      <div className="pt-1 max-w-7xl mx-auto w-full">
         <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
               <div key={i}>
                  <div className="md:hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3 shadow-sm h-[70px] flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-24 bg-red-50 dark:bg-red-900/10" />
                     </div>
                     
                     <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-48 opacity-70" />
                        <Skeleton className="h-4 w-12 bg-green-50 dark:bg-green-900/10" />
                     </div>
                  </div>

                  <div className="hidden md:grid grid-cols-12 gap-4 items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-4 h-[64px] shadow-sm">
                     <div className="col-span-4">
                        <Skeleton className="h-5 w-48" />
                     </div>

                     <div className="col-span-2">
                        <Skeleton className="h-4 w-24 opacity-60" />
                     </div>

                     <div className="col-span-2">
                        <Skeleton className="h-4 w-32 opacity-70 bg-green-50/50 dark:bg-green-900/5" />
                     </div>

                     <div className="col-span-2 text-right">
                        <Skeleton className="h-5 w-24 ml-auto bg-red-50 dark:bg-red-900/10" />
                     </div>

                     <div className="col-span-2 flex justify-end">
                        <Skeleton className="h-5 w-16 bg-green-50 dark:bg-green-900/10" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}