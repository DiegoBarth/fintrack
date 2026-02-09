import type { CategorySummary } from '../../types/Dashboard'
import { numberToCurrency } from '../../utils/formatters'

interface TopCategoriesProps {
   categories: CategorySummary[]
}

export function TopCategories({ categories }: TopCategoriesProps) {
   if (!categories.length) return null

   const maxTotal = categories[0].total

   return (
      <section className="rounded-xl border bg-card p-4 shadow-sm">
         <h2 className="mb-6 text-sm font-semibold text-muted-foreground">
            Top categorias
         </h2>
         <div className="h-56 sm:h-64 lg:h-60 w-full">
            <ul className="space-y-2">
               {categories.map(c => (
                  <li
                     key={c.category}
                     className="flex items-center gap-2"
                  >
                     <span className="w-24 truncate text-xs">
                        {c.category}
                     </span>

                     <div className="flex-1 h-1.5 rounded-full bg-muted">
                        <div
                           className="h-1.5 rounded-full bg-red-500"
                           style={{ width: `${(c.total / maxTotal) * 100}%` }}
                        />
                     </div>

                     <span className="w-20 text-right text-xs text-muted-foreground">
                        {numberToCurrency(c.total)}
                     </span>
                  </li>
               ))}
            </ul>
         </div>
      </section>
   )
}