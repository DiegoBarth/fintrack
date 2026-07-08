import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Area, ComposedChart } from 'recharts'
import { numberToCurrency } from '@/utils/formatters'
import { usePeriod } from '@/contexts/PeriodContext'
import { useSummary } from '@/hooks/useSummary'
import type { MonthlyBalanceHistory } from '@/types/Dashboard'
import { useTheme } from '@/contexts/ThemeContext'

interface YearlyBalanceProps {
  data: MonthlyBalanceHistory[]
}

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5,
  JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11
}

export default function YearlyBalanceChart({ data }: YearlyBalanceProps) {
  const { month, year } = usePeriod();
  const { summary } = useSummary(month, String(year));
  const { theme } = useTheme();

  const tickColor = theme === 'dark' ? '#9ca3af' : '#64748b';
  const gridColor = theme === 'dark' ? '#374151' : '#e2e8f0';

  const currentBalance = summary
    ? summary.totalReceivedAmount - summary.totalPaidExpenses - summary.totalPaidCommitments
    : 0

  const today = new Date();
  const systemYear = today.getFullYear();
  const systemMonthIndex = today.getMonth(); // 0-11

  const selectedYear = Number(year);
  const selectedMonthIndex = Number(month) - 1;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const activePayload = payload.find((p: any) => p.value !== undefined && p.value !== null)
      if (!activePayload) return null

      const value = activePayload.value
      const isPositive = value >= 0
      const itemMonthIndex = MONTH_MAP[activePayload.payload.month.toUpperCase()]

      const isFuture = selectedYear > systemYear || (selectedYear === systemYear && itemMonthIndex > systemMonthIndex);

      return (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border-2 border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {activePayload.payload.month} {isFuture && <span className="text-blue-500 ml-1">(Projeção)</span>}
          </p>
          <p className={`text-lg font-bold ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {numberToCurrency(value)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {isPositive ? '✓ Positivo' : '⚠ Negativo'}
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

  const dataWithColors = data.map(item => {
    const itemMonthIndex = MONTH_MAP[item.month.toUpperCase()];

    const isFuture = selectedYear > systemYear || (selectedYear === systemYear && itemMonthIndex > systemMonthIndex);
    const isCurrent = selectedYear === systemYear && itemMonthIndex === systemMonthIndex;

    return {
      ...item,
      positiveBalance: item.balance >= 0 ? item.balance : null,
      negativeBalance: item.balance < 0 ? item.balance : null,
      realBalance: !isFuture ? item.balance : null,
      futureBalance: isFuture || isCurrent ? item.balance : null,
    };
  })

  return (
    <section
      className="
        rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm h-full flex flex-col
      "
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
          Saldo ao longo do ano
        </h2>

        {/* Legend */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Positivo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Negativo</span>
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
              stroke={gridColor}
              opacity={0.6}
            />

            <ReferenceLine
              y={0}
              stroke={tickColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'Zero',
                position: 'right',
                fill: tickColor,
                fontSize: 11,
                fontWeight: 600
              }}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              height={50}
              angle={-45}
              textAnchor="end"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickFormatter={formatYValue}
              width={55}
              tickCount={8}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: tickColor, strokeWidth: 1 }} />

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
              dataKey="realBalance"
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

            <Line
              type="monotone"
              dataKey="futureBalance"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              strokeDasharray="6 4"
              opacity={0.65}
              dot={{
                fill: '#fff',
                stroke: '#9ca3af',
                strokeWidth: 1.5,
                r: 3
              }}
              activeDot={{
                fill: '#9ca3af',
                stroke: '#fff',
                strokeWidth: 2,
                r: 5,
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
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Maior</p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {numberToCurrency(Math.max(...data.map(d => d.balance)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Menor</p>
          <p className="text-sm font-bold text-red-700 dark:text-red-400">
            {numberToCurrency(Math.min(...data.map(d => d.balance)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Atual</p>
          <p className={`text-sm font-bold ${currentBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {numberToCurrency(currentBalance)}
          </p>
        </div>
      </div>
    </section>
  )
}