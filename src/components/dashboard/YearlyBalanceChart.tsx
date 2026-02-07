import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyBalanceHistory } from '../../types/Dashboard';

interface YearlyBalanceChartProps {
   data: MonthlyBalanceHistory[];
   loading: boolean;
}

export function YearlyBalanceChart({ data, loading }: YearlyBalanceChartProps) {
   if (loading) return <p>Carregando saldo anual...</p>;

   return (
      <div style={{ width: '100%', height: 300, marginBottom: 40 }}>
         <h2>Saldo ao longo do ano</h2>

         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
               <XAxis dataKey="month" />
               <YAxis />
               <Tooltip />
               <Line type="monotone" dataKey="balance" stroke="#3498db" strokeWidth={2} />
            </LineChart>
         </ResponsiveContainer>
      </div>
   );
}