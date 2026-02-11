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
      default: 'border bg-background hover:bg-muted hover:shadow-md',
      success: 'border-green-200 bg-green-50 hover:bg-green-100/50 hover:shadow-md',
      danger: 'border-red-200 bg-red-50 hover:bg-red-100/50 hover:shadow-md',
      warning: 'border-amber-200 bg-amber-50 hover:bg-amber-100/50 hover:shadow-md',
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