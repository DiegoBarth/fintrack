import { numberToCurrency } from "@/utils/formatters"
import { Skeleton } from "../ui/Skeleton"

interface SummaryCardProps {
   title: string
   amount: number
   color: string
   isLoading?: boolean
   icon?: React.ReactNode
}

/**
 * A reusable card component to display financial metrics with a color indicator,
 * an icon, and a loading skeleton state.
 */
export function SummaryCard({
   title,
   amount,
   color,
   isLoading,
   icon
}: SummaryCardProps) {
   return (
      <div
         className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
         style={{ borderLeft: `5px solid ${color}` }}
      >
         <div className="flex items-center gap-3">
            {icon && (
               <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${color}20` }}
               >
                  <span style={{ color: color }}>{icon}</span>
               </div>
            )}
            <div>
               <p className="text-sm text-muted-foreground">{title}</p>
               {isLoading ? (
                  <Skeleton className="h-6 w-24 rounded-md" />
               ) : (
                  <p className="text-lg font-semibold" style={{ color: color }}>
                     {numberToCurrency(amount)}
                  </p>
               )}
            </div>
         </div>
      </div>
   )
}