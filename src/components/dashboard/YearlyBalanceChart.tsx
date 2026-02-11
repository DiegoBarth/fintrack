import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Area, ComposedChart } from 'recharts'
import { motion } from 'framer-motion'
import { numberToCurrency } from '@/utils/formatters'
import { usePeriod } from '@/contexts/PeriodContext'
import type { MonthlyBalanceHistory } from '@/types/Dashboard'

interface YearlyBalanceProps {
   data: MonthlyBalanceHistory[]
}

export function YearlyBalanceChart({ data }: YearlyBalanceProps) {
   const { summary } = usePeriod();

   const currentBalance = summary
      ? summary.totalReceivedAmount - summary.totalPaidExpenses - summary.totalPaidCommitments
      : 0

   const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
         const value = payload[0].value
         const isPositive = value >= 0

         return (
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border-2 border-gray-100">
               <p className="text-xs font-medium text-gray-500 mb-1">
                  {payload[0].payload.month}
               </p>
               <p className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {numberToCurrency(value)}
               </p>
               <p className="text-xs text-gray-400 mt-1">
                  {isPositive ? '✓ Positive' : '⚠ Negative'}
               </p>
            </div>
         )
      }
      return null
   }

   const formatYValue = (value: number) => {
      if (Math.abs(value) >= 1000) {
         const formattedValue = (value / 1000).toFixed(1)
         return `${value >= 0 ? '+' : ''}${formattedValue}k`
      }
      return `${value >= 0 ? '+' : ''}${value}`
   }

   // Splits data into positive and negative for different area colors
   const dataWithColors = data.map(item => ({
      ...item,
      positiveBalance: item.balance >= 0 ? item.balance : null,
      negativeBalance: item.balance < 0 ? item.balance : null,
   }))

   return (
      <motion.section
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="rounded-xl border bg-card p-4 md:p-6 shadow-sm h-full flex flex-col"
      >
         <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
               Balance over the year
            </h2>

            {/* Legend */}
            <div className="flex gap-3 text-xs">
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-600">Positive</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Negative</span>
               </div>
            </div>
         </div>

         <div className="flex-1 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={dataWithColors} margin={{ top: 10, right: 15, left: 5, bottom: 25 }}>
                  <defs>
                     <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                     </linearGradient>
                     <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                     </linearGradient>
                  </defs>

                  <CartesianGrid
                     vertical={false}
                     strokeDasharray="3 3"
                     stroke="#e2e8f0"
                     opacity={0.6}
                  />

                  <ReferenceLine
                     y={0}
                     stroke="#64748b"
                     strokeWidth={2}
                     strokeDasharray="5 5"
                     label={{
                        value: 'Zero',
                        position: 'right',
                        fill: '#64748b',
                        fontSize: 11,
                        fontWeight: 600
                     }}
                  />

                  <XAxis
                     dataKey="month"
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: '#64748b', fontSize: 11 }}
                     height={50}
                     angle={-45}
                     textAnchor="end"
                  />

                  <YAxis
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: '#64748b', fontSize: 11 }}
                     tickFormatter={formatYValue}
                     width={55}
                     tickCount={8}
                     domain={['auto', 'auto']}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />

                  <Area
                     type="monotone"
                     dataKey="positiveBalance"
                     stroke="none"
                     fill="url(#colorPositive)"
                     animationDuration={1500}
                  />

                  <Area
                     type="monotone"
                     dataKey="negativeBalance"
                     stroke="none"
                     fill="url(#colorNegative)"
                     animationDuration={1500}
                  />

                  <Line
                     type="monotone"
                     dataKey="balance"
                     stroke="url(#lineGradient)"
                     strokeWidth={3}
                     dot={{
                        fill: '#fff',
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        r: 4
                     }}
                     activeDot={{
                        fill: '#3b82f6',
                        stroke: '#fff',
                        strokeWidth: 2,
                        r: 6,
                     }}
                     animationDuration={2000}
                  />

                  <defs>
                     <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        {dataWithColors.map((item, index) => {
                           const percent = (index / (dataWithColors.length - 1)) * 100
                           const color = item.balance >= 0 ? '#10b981' : '#ef4444'
                           return (
                              <stop
                                 key={index}
                                 offset={`${percent}%`}
                                 stopColor={color}
                              />
                           )
                        })}
                     </linearGradient>
                  </defs>
               </ComposedChart>
            </ResponsiveContainer>
         </div>

         {/* Quick Stats */}
         <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
               <p className="text-xs text-gray-500">Highest</p>
               <p className="text-sm font-bold text-emerald-600">
                  {numberToCurrency(Math.max(...data.map(d => d.balance)))}
               </p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-500">Lowest</p>
               <p className="text-sm font-bold text-red-600">
                  {numberToCurrency(Math.min(...data.map(d => d.balance)))}
               </p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-500">Current</p>
               <p className={`text-sm font-bold ${currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {numberToCurrency(currentBalance)}
               </p>
            </div>
         </div>
      </motion.section>
   )
}