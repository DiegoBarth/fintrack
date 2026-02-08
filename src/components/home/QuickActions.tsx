import React from "react"
import { Minus, Plus, Calendar, BarChart3 } from "lucide-react"
import { Button } from "../ui/Button";
import { useNavigate } from 'react-router-dom';

interface QuickAction {
   id: string
   label: string
   icon: React.ReactNode
   onClick?: () => void
}

/**
 * Navigation component that provides fast access to main application modules.
 * Used primarily on the Home dashboard for better mobile/desktop UX.
 */
export function QuickActions() {
   const navigate = useNavigate();

   const actions: QuickAction[] = [
      {
         id: "new-expense",
         label: "Novo Gasto",
         icon: <Minus className="h-5 w-5" />,
         onClick: () => navigate('/expenses'),
      },
      {
         id: "new-income",
         label: "Nova Receita",
         icon: <Plus className="h-5 w-5" />,
         onClick: () => navigate('/incomes'),
      },
      {
         id: "commitments",
         label: "Compromissos",
         icon: <Calendar className="h-5 w-5" />,
         onClick: () => navigate('/commitments'),
      },
      {
         id: "dashboard",
         label: "Dashboard",
         icon: <BarChart3 className="h-5 w-5" />,
         onClick: () => navigate('/dashboard'),
      },
   ]

   return (
      <div className="space-y-4">
         <h2 className="text-lg font-semibold text-foreground">Ações rápidas</h2>

         <div className="grid grid-cols-4 gap-2">
            {actions.map((action) => (
               <Button
                  key={action.id}
                  variant="ghost"
                  className="flex h-auto flex-col items-center gap-2 rounded-lg p-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={action.onClick}
               >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                     {action.icon}
                  </div>
                  <span className="text-center text-xs leading-tight">{action.label}</span>
               </Button>
            ))}
         </div>
      </div>
   )
}