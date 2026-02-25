interface Props {
   className?: string
}

export function Skeleton({ className = '' }: Props) {
   return (
      <div
         className={`
            relative overflow-hidden rounded-md 
            /* Light: fundo mais sólido | Dark: cinza médio */
            bg-zinc-200 dark:bg-gray-700/50 
            before:content-['']
            before:absolute
            before:inset-y-0
            before:left-0
            before:w-full
            before:-translate-x-full
            before:animate-shimmer
            before:bg-gradient-to-r
            before:from-transparent
            before:via-zinc-300/60 dark:before:via-gray-600/30
            before:to-transparent
            ${className}
         `}
      />
   )
}