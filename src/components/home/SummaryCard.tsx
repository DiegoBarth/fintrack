import { numberToCurrency } from "@/utils/formatters"
import { Skeleton } from "@/components/ui/Skeleton"
import { motion, number } from "framer-motion"

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
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="flex items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 md:p-5
               shadow-sm transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700"
        style={{ borderLeft: `5px solid ${color}` }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {icon && (
            <div
              className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <span style={{ color: color }}>{icon}</span>
            </div>
          )}
          <div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 md:h-8 w-28 md:w-32 rounded-md" />
            ) : (
              <p className="text-xl md:text-2xl font-bold" style={{ color: color }}>
                {numberToCurrency(amount)}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}