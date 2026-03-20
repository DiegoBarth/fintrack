import { numberToCurrency } from "@/utils/formatters"
import { Skeleton } from "@/components/ui/Skeleton"

interface SummaryCardProps {
  title: string
  amount: number
  color: string
  isLoading?: boolean
  icon?: React.ReactNode
  /** Optional line below the value (e.g. "Includes carryover from previous month: +R$ 41,00") */
  subtitle?: string
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
  icon,
  subtitle
}: SummaryCardProps) {
  const hasSubtitle = Boolean(subtitle)
  return (
    <div className="summary-card">
      <div
        className={`flex justify-between rounded-xl bg-white dark:bg-gray-800 p-3 md:p-5 shadow-sm transition-shadow hover:shadow-lg border border-gray-100 dark:border-gray-700 ${
          hasSubtitle
            ? 'min-h-[68px] items-start md:min-h-[78px]'
            : 'h-[68px] items-center md:h-[78px]'
        }`}
        style={{ borderLeft: `5px solid ${color}` }}
      >
        <div className={`flex gap-2.5 md:gap-4 ${hasSubtitle ? 'items-start pt-0.5' : 'items-center'}`}>
          {icon && (
            <div
              className="flex h-9 w-9 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <span className="scale-90 md:scale-100" style={{ color: color }}>{icon}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] md:text-sm text-muted-foreground font-medium leading-tight">{title}</p>
            {isLoading ? (
              <Skeleton className="h-6 md:h-8 w-24 md:w-32 rounded-md mt-0.5" />
            ) : (
              <>
                <p className="text-lg md:text-2xl font-bold leading-tight" style={{ color: color }}>
                  {numberToCurrency(amount)}
                </p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}