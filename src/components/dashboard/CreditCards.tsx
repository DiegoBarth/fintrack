import type { CreditCardSummary } from '../../types/Dashboard';
import { numberToCurrency } from '../../utils/formatters';

interface CreditCardsProps {
   cards: CreditCardSummary[];
   loading: boolean;
}

export function CreditCards({ cards, loading }: CreditCardsProps) {
   if (loading) return <p>Carregando cartões...</p>;

   return (
      <div>
         <h2>Cartões</h2>
         <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {cards.map(card => (
               <div key={card.cardName} style={{
                  minWidth: 215,
                  borderRadius: 12,
                  padding: 16,
                  color: '#fff',
                  background: '#222',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
               }}>
                  <img src={`${import.meta.env.BASE_URL}cartoes/${card.image}.jpg`} alt={card.cardName} style={{ width: '100%', borderRadius: 8 }} />
                  <h3 style={{ margin: '0 0 8px 0' }}>{card.cardName}</h3>

                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                     <p style={{ margin: '4px 0' }}>
                        Fatura: <strong>{numberToCurrency(card.statementTotal)}</strong>
                     </p>
                     <p style={{ margin: '4px 0' }}>
                        Limite disponível: {numberToCurrency(card.availableLimit)}
                     </p>
                     <p style={{ margin: '4px 0', fontSize: '0.8rem', opacity: 0.7 }}>
                        Limite total: {numberToCurrency(card.totalLimit)}
                     </p>
                  </div>

                  <div style={{
                     marginTop: 12,
                     height: 6,
                     background: '#444',
                     borderRadius: 3,
                     overflow: 'hidden'
                  }}>
                     <div style={{
                        width: `${card.usedPercentage}%`,
                        height: '100%',
                        background: card.usedPercentage > 90 ? '#e74c3c' : '#2ecc71'
                     }} />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}