import { Skeleton } from "@/components/ui/Skeleton"

export function CommitmentSkeleton() {
   return (
      <div className="pt-1 max-w-7xl mx-auto w-full">
         
         <div className="flex gap-2 mb-4 overflow-hidden pb-3 border-b border-border">
            <Skeleton className="h-8 w-16 rounded-[30px]" />
            <Skeleton className="h-8 w-12 rounded-[30px] opacity-60" />
            <Skeleton className="h-8 w-20 rounded-[30px] opacity-60" />
            <Skeleton className="h-8 w-16 rounded-[30px] opacity-60" />
         </div>

         <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
               <Skeleton className="h-4 w-12" />
               <Skeleton className="h-5 w-32" />
            </div>

            <div className="space-y-3">
               {[...Array(6)].map((_, i) => (
                  <div key={i}>
                     <div className="md:hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3 shadow-sm h-[110px] flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                           <Skeleton className="h-5 w-40" />
                           <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="min-h-[1rem]">
                           <Skeleton className="h-3 w-16 opacity-50" />
                        </div>
                        <div className="mt-1 flex items-end justify-between">
                           <div className="flex flex-col gap-1.5">
                              <Skeleton className="h-3 w-28 opacity-70 bg-amber-50/50 dark:bg-amber-900/10" />
                              <Skeleton className="h-3 w-36 opacity-70 bg-green-50/50 dark:bg-green-900/10" />
                           </div>
                           <Skeleton className="h-4 w-12 opacity-80" />
                        </div>
                     </div>

                     <div className="hidden md:grid grid-cols-12 gap-4 items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-4 h-[64px] shadow-sm">
                        <div className="col-span-4">
                           <Skeleton className="h-5 w-52" />
                        </div>
                        <div className="col-span-2">
                           <Skeleton className="h-4 w-16 opacity-60" />
                        </div>
                        <div className="col-span-2">
                           <Skeleton className="h-4 w-36 opacity-70" />
                        </div>
                        <div className="col-span-2 text-right">
                           <Skeleton className="h-5 w-24 ml-auto" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                           <Skeleton className="h-4 w-12" />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}