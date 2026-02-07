import type { CategorySummary } from '../../types/Dashboard';
import { numberToCurrency } from '../../utils/formatters';

interface TopCategoriesProps {
   categories: CategorySummary[];
   loading: boolean;
}

export function TopCategories({ categories, loading }: TopCategoriesProps) {
   if (loading) return <p>Carregando categorias...</p>;

   const maxTotal = categories.length > 0 ? categories[0].total : 0;

   return (
      <div style={{ marginBottom: 32 }}>
         <h2>Top 10 categorias</h2>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map((item, index) => {
               const percentage = maxTotal ? (item.total / maxTotal) * 100 : 0;

               return (
                  <div key={item.category} style={{ display: 'flex', alignItems: 'center' }}>
                     <span style={{
                        width: 140,
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                     }}>
                        {item.category}
                     </span>

                     <div style={{
                        flex: 1,
                        height: 12,
                        background: '#f0f0f0',
                        borderRadius: 6,
                        margin: '0 12px',
                        overflow: 'hidden'
                     }}>
                        <div style={{
                           width: `${percentage}%`,
                           height: '100%',
                           background: `rgba(231, 76, 60, ${Math.max(0.4, 1 - index * 0.08)})`,
                           borderRadius: 6,
                           transition: 'width 0.8s ease-out'
                        }} />
                     </div>

                     <span style={{ width: 100, textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {numberToCurrency(item.total)}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>
   );
}