import { useAlerts } from "../../contexts/UseAlerts"

interface AlertItem {
   id: string
   description: string
   date: string
}

interface AlertCardProps {
   title: string
   items: AlertItem[]
   gradientFrom: string
   gradientTo: string
}

/**
 * Sub-component to render a styled alert card with a gradient background.
 */
function AlertCard({ title, items, gradientFrom, gradientTo }: AlertCardProps) {
   return (
      <div
         className="rounded-xl p-4 text-white shadow-md"
         style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
         }}
      >
         <h3 className="mb-2 text-sm font-semibold">{title}</h3>
         <ul className="space-y-1 text-sm">
            {items.map(item => (
               <li key={item.id} className="flex items-center gap-1">
                  <span className="text-white/80">•</span>
                  <span>
                     {item.description} ({item.date})
                  </span>
               </li>
            ))}
         </ul>
      </div>
   )
}

/**
 * Component that displays due date alerts for the current day and week.
 */
export function Alerts() {
   const { today, week } = useAlerts()

   // Mapping week due dates
   const weekDueDates: AlertItem[] = week.map(c => ({
      id: String(c.rowIndex),
      description: c.description,
      date: c.dueDate,
   }))

   // Mapping today's due dates
   const todayDueDates: AlertItem[] = today.map(c => ({
      id: String(c.rowIndex),
      description: c.description,
      date: c.dueDate,
   }))

   // If no alerts exist, don't render anything
   if (!weekDueDates.length && !todayDueDates.length) return null

   return (
      <div className="grid grid-cols-2 gap-3">
         {todayDueDates.length > 0 && (
            <AlertCard
               title={`${todayDueDates.length} ${todayDueDates.length === 1 ? 'conta' : 'contas'} vencendo hoje`}
               items={todayDueDates}
               gradientFrom="#db2777"
               gradientTo="#f472b6"
            />
         )}

         {weekDueDates.length > 0 && (
            <AlertCard
               title="Vencimentos Semana"
               items={weekDueDates}
               gradientFrom="#7c3aed"
               gradientTo="#a855f7"
            />
         )}
      </div>
   )
}