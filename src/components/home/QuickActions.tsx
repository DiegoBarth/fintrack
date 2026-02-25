import { Link } from "react-router-dom"
import { Plus, Minus, Calendar, BarChart3 } from "lucide-react"
import React from "react"

const actions = [
   {
      icon: Plus,
      label: "Receitas",
      href: "/incomes",
      color: "text-emerald-400 dark:text-emerald-400",
      bg: "bg-emerald-50",
      hover: "hover:bg-emerald-100",
   },
   {
      icon: Minus,
      label: "Gastos",
      href: "/expenses",
      color: "text-rose-400 dark:text-rose-400",
      bg: "bg-rose-50",
      hover: "hover:bg-rose-100",
   },
   {
      icon: Calendar,
      label: "Compromissos",
      href: "/commitments",
      color: "text-amber-400 dark:text-amber-400",
      bg: "bg-amber-50",
      hover: "hover:bg-amber-100",
   },
   {
      icon: BarChart3,
      label: "Dashboard",
      href: "/dashboard",
      color: "text-blue-400 dark:text-blue-400",
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100",
   },
]

export default React.memo(function QuickActions() {
   return (
      <div className="py-4 px-6 bg-white dark:bg-gray-800 rounded-lg ">
         <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Ações rápidas</h3>

         <div className="grid grid-cols-4 gap-4">
            {actions.map((action) => {
               const Icone = action.icon
               return (
                  <Link
                     key={action.href}
                     to={action.href}
                     className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl
                        ${action.hover}
                        hover:scale-105 active:scale-95
                        transition-transform duration-200
                        focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500
                        group
                     `}
                  >
                     <div className={`
                        ${action.color} 
                        ${action.bg}
                        bg-gray-50 dark:bg-gray-700
                        p-3 rounded-full
                        group-hover:shadow-md
                        transition-shadow duration-200
                     `}>
                        <Icone className="w-6 h-6" />
                     </div>
                     <span className={`
                        text-xs text-gray-600 dark:text-gray-300
                        text-center
                        group-hover:font-medium
                        transition-colors duration-200
                     `}>
                        {action.label}
                     </span>
                  </Link>
               )
            })}
         </div>
      </div>
   )
})
