import type { CategorySummary } from '../../types/Dashboard'
import { numberToCurrency } from '../../utils/formatters'

interface TopCategoriesProps {
   categories: CategorySummary[]
   loading: boolean
}

export function TopCategories({ categories, loading }: TopCategoriesProps) {
   if (loading) return <p className="text-sm text-muted-foreground">Carregando categorias...</p>

   if (!categories.length) return null

   const maxTotal = categories[0].total

   return (
      <section className="rounded-xl border bg-card p-4">
         <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            Top categorias
         </h2>

         <ul className="space-y-3">
            {categories.map(c => (
               <li key={c.category}>
                  <div className="mb-1 flex justify-between text-sm">
                     <span>{c.category}</span>
                     <span className="text-muted-foreground">
                        {numberToCurrency(c.total)}
                     </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted">
                     <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${(c.total / maxTotal) * 100}%` }}
                     />
                  </div>
               </li>
            ))}
         </ul>
      </section>
   )
}