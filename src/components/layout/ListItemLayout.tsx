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
      default: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md',
      success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 hover:bg-green-100/50 dark:hover:bg-green-800/40 hover:shadow-md',
      danger: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 hover:bg-red-100/50 dark:hover:bg-red-800/40 hover:shadow-md',
      warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100/50 dark:hover:bg-amber-800/40 hover:shadow-md'
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