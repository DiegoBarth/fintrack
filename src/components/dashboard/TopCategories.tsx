import { useMemo } from 'react'
import {
  GraduationCap,
  Gamepad2,
  UtensilsCrossed,
  Home,
  Car,
  Heart,
  Plane,
  Wallet,
  Building2,
  Sparkles,
  PawPrint,
  Gift,
  ShoppingBag,
  Wrench,
  Tv,
  Phone,
  TrendingUp,
  Banknote
} from 'lucide-react'
import type { CategorySummary } from '@/types/Dashboard'
import { numberToCurrency } from '@/utils/formatters'
import { CATEGORIES } from '@/config/constants'

const categoryIcons: Record<string, React.ElementType> = {
  [CATEGORIES[0]]: UtensilsCrossed,    // Food & Dining
  [CATEGORIES[1]]: Building2,          // Banking
  [CATEGORIES[2]]: Sparkles,           // Beauty
  [CATEGORIES[3]]: Home,               // Home
  [CATEGORIES[4]]: GraduationCap,      // Education
  [CATEGORIES[5]]: Banknote,           // Loans
  [CATEGORIES[6]]: TrendingUp,         // Investment
  [CATEGORIES[7]]: Gamepad2,           // Leisure
  [CATEGORIES[8]]: PawPrint,           // Pets
  [CATEGORIES[9]]: Gift,               // Gifts
  [CATEGORIES[10]]: ShoppingBag,       // Clothing
  [CATEGORIES[11]]: Heart,             // Health
  [CATEGORIES[12]]: Wrench,            // Services
  [CATEGORIES[13]]: Tv,                // Streaming
  [CATEGORIES[14]]: Phone,             // Phone/Internet
  [CATEGORIES[15]]: Car,               // Transport
  [CATEGORIES[16]]: Plane,             // Travel
}

interface TopCategoriesProps {
  categories: CategorySummary[]
}

/**
 * Top categories with optimized percentage calculation.
 * * Optimizations:
 * - useMemo: Memoizes the maximum value (avoids accessing categories[0] in every iteration).
 * - Recalculates only when the categories array changes.
 */
export default function TopCategories({ categories }: TopCategoriesProps) {
  // Memoizes the maximum value (used for calculating bar percentages)
  // Recalculates only when categories change
  const maxAmount = useMemo(
    () => categories.length > 0 ? categories[0].total : 0,
    [categories]
  )

  const getStyles = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage > 70) return {
      bar: 'bg-red-500 dark:bg-red-600',
      text: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-500'
    }

    if (percentage > 40) return {
      bar: 'bg-orange-500 dark:bg-orange-600',
      text: 'text-orange-700 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      icon: 'text-orange-500'
    }

    if (percentage > 20) return {
      bar: 'bg-amber-500 dark:bg-amber-600',
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'text-amber-500'
    }

    return {
      bar: 'bg-slate-400',
      text: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-700/30',
      icon: 'text-slate-400'
    }
  }

  if (!categories.length) return null

  return (
    <section
      className="
        rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-full flex flex-col
        opacity-0 translate-y-4
        animate-[fadeUp_.4s_ease-out_forwards]
      ">
      <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Top Categories
      </h2>
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {categories.map((item, index) => {
          const IconComponent = categoryIcons[item.category] || Wallet
          const percentage = (item.total / maxAmount) * 100
          const styles = getStyles(item.total, maxAmount)

          return (
            <section key={item.category} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${styles.bg}`}>
                <IconComponent className={`w-4 h-4 ${styles.icon}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.category}
                  </span>
                  <span className={`text-sm font-semibold ml-2 ${styles.text}`}>
                    {numberToCurrency(item.total)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <section className={`h-2 rounded-full ${styles.bar}`} />
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}