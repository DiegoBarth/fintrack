import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'danger' | 'warning'

interface Props {
   children: ReactNode
   onClick?: () => void
   variant?: Variant
   className?: string
}

export function ListItemLayout({
   children,
   onClick,
   variant = 'default',
   className,
}: Props) {
   const variants: Record<Variant, string> = {
      default: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:shadow-md',
      success: 'border border-green-200/80 dark:border-green-800/60 bg-green-50/80 dark:bg-green-900/20 hover:bg-green-100/60 dark:hover:bg-green-800/30 hover:shadow-md',
      danger: 'border border-red-200/80 dark:border-red-800/60 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/60 dark:hover:bg-red-800/30 hover:shadow-md',
      warning: 'border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-900/20 hover:bg-amber-100/60 dark:hover:bg-amber-800/30 hover:shadow-md'
   }

   return (
      <div
         onClick={onClick}
         className={cn(
            'rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.01]',
            variants[variant],
            className
         )}
      >
         {children}
      </div>
   )
}