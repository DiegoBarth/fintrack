import { numberToCurrency } from '../../utils/formatters';

interface SummaryCardProps {
   title: string;
   amount: number;
   color?: string;
   loading: boolean;
}

export function SummaryCard({ title, amount, color, loading }: SummaryCardProps) {
   const defaultColor =
      color ?? (amount >= 0 ? '#2ecc71' : '#e74c3c');

   return (
      <div
         style={{
            padding: 16,
            borderRadius: 8,
            background: '#f5f5f5',
            borderLeft: `6px solid ${defaultColor}`,
         }}
      >
         <strong>{title}</strong>
         {loading ? (
            <p>Carregando...</p>
         ) : (
            <h2 style={{ margin: '8px 0' }}>
               {numberToCurrency(amount)}
            </h2>
         )}
      </div>
   );
}