import { useAlerts } from "../contexts/UseAlerts";

export function Alerts() {
   const { today, week } = useAlerts();

   if (!today.length && !week.length) return null;

   return (
      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
         {today.length > 0 && (
            <div style={{ padding: 12, background: '#fceabb', borderRadius: 8, borderLeft: '4px solid #f39c12' }}>
               <strong>⚠️ Compromissos vencendo hoje:</strong>
               <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {today.map(commitment => (
                     <li key={commitment.rowIndex}>
                        {commitment.description} ({commitment.dueDate})
                     </li>
                  ))}
               </ul>
            </div>
         )}

         {week.length > 0 && (
            <div style={{ padding: 12, background: '#fff3cd', borderRadius: 8, borderLeft: '4px solid #ffc107' }}>
               <strong>⏳ Compromissos vencendo esta semana:</strong>
               <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {week.map(commitment => (
                     <li key={commitment.rowIndex}>
                        {commitment.description} ({commitment.dueDate})
                     </li>
                  ))}
               </ul>
            </div>
         )}
      </div>
   );
}