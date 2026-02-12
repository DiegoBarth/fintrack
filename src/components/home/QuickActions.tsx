import { Link } from "react-router-dom"
import { Plus, Minus, Calendar, BarChart3 } from "lucide-react"

/**
 * Component providing quick navigation buttons for the main features of the app.
 * Optimized for touch targets and visual clarity on the Home screen.
 */
export function QuickActions() {
   const actions = [
      { icon: Plus, label: 'Receitas', href: '/incomes', color: 'text-green-600', hoverBg: 'hover:bg-green-50' },
      { icon: Minus, label: 'Gastos', href: '/expenses', color: 'text-red-600', hoverBg: 'hover:bg-red-50' },
      { icon: Calendar, label: 'Compromissos', href: '/commitments', color: 'text-amber-600', hoverBg: 'hover:bg-amber-50' },
      { icon: BarChart3, label: 'Dashboard', href: '/dashboard', color: 'text-blue-600', hoverBg: 'hover:bg-blue-50' },
   ]

   return (
      <div className="py-4 px-6 bg-white dark:bg-gray-800 rounded-lg">
         <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Ações rápidas</h3>

         <div className="grid grid-cols-4 gap-4">
            {actions.map((action) => {
               const Icone = action.icon
               return (
                  <Link
                     key={action.href}
                     to={action.href}
                     className={`
                        flex flex-col items-center gap-2 p-3 rounded-lg 
                        ${action.hoverBg} dark:hover:bg-gray-700
                        hover:scale-105 
                        transition-all duration-200
                        group
                     `}
                  >
                     <div className={`
                        ${action.color} 
                        bg-gray-50 dark:bg-gray-700
                        p-3 rounded-full
                        group-hover:shadow-md
                        transition-shadow duration-200
                     `}>
                        <Icone className="w-6 h-6" />
                     </div>
                     <span className="text-xs text-gray-600 dark:text-gray-300 text-center group-hover:font-medium transition-all">
                        {action.label}
                     </span>
                  </Link>
               )
            })}
         </div>
      </div>
   )
}