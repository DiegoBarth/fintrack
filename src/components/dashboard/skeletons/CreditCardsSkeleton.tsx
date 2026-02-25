import { Skeleton } from '@/components/ui/Skeleton'

export function CreditCardsSkeleton() {
  return (
    <section className="relative mt-2 h-[420px] sm:h-[460px] overflow-hidden select-none animate-[fadeUp_.4s_ease-out_forwards]">

      <div className="flex items-center justify-between mb-4 px-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="relative mx-auto h-full w-full max-w-4xl">

        <div
          className="
            absolute left-1/2
            top-6 sm:top-10
            -translate-x-1/2
            w-[75%] sm:w-80
            rounded-xl
            p-4
            shadow-2xl
            bg-white dark:bg-zinc-900
            z-20
          "
        >
          <Skeleton className="mb-3 h-32 sm:h-44 w-full rounded-lg" />
          <Skeleton className="h-5 w-40 mb-2" />

          <div className="mt-2 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-zinc-300/50 pb-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex justify-between pt-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        <div
          className="
            pointer-events-none
            absolute left-1/2
            translate-x-[100px] sm:translate-x-[220px] lg:translate-x-[260px]
            w-[75%] sm:w-80
            rounded-xl
            p-4
            shadow-2xl
            bg-white dark:bg-zinc-900
            opacity-50
            scale-75
            z-10
          "
        >
          <Skeleton className="mb-3 h-44 sm:h-44 w-full rounded-lg" />
          <Skeleton className="h-5 w-32 mb-2" />
        </div>



      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-50 ">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-2 w-2 rounded-full before:bg-gray-300 before:dark:bg-gray-600" />
        ))}
      </div>
    </section>
  );
}