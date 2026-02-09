import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { MonthlyBalanceHistory } from '@/types/Dashboard'

interface YearlyBalanceProps {
   data: MonthlyBalanceHistory[]
}

export function YearlyBalanceChart({ data }: YearlyBalanceProps) {
   return (
      <section className="rounded-xl border bg-card p-4 shadow-sm">
         <h2 className="mb-6 text-sm font-semibold text-muted-foreground">
            Saldo ao longo do ano
         </h2>

         <div className="h-56 sm:h-64 lg:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                     </linearGradient>
                  </defs>

                  <CartesianGrid
                     vertical={false}
                     strokeDasharray="3 3"
                     stroke="#e2e8f0"
                     opacity={0.5}
                  />

                  <XAxis
                     dataKey="date"
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: '#94a3b8', fontSize: 12 }}
                     dy={10}
                  />

                  <YAxis
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />

                  <Tooltip
                     contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                     }}
                  />

                  <Area
                     type="monotone"
                     dataKey="balance"
                     stroke="#3b82f6"
                     strokeWidth={3}
                     fillOpacity={1}
                     fill="url(#colorBalance)"
                     animationDuration={1500}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </section>
   )
}