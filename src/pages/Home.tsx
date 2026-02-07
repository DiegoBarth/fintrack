import { useNavigate } from 'react-router-dom';

export function Home() {
   const navigate = useNavigate();

   const totalIncomes = 4500;
   const totalExpenses = 3120;
   const balance = totalIncomes - totalExpenses;

   return (
      <div style={{ padding: 16 }}>
         <h1>Dashboard</h1>

         <section style={{ display: 'grid', gap: 12 }}>
            <SummaryCard
               title="Entradas"
               amount={totalIncomes}
               color="#2ecc71"
            />

            <SummaryCard
               title="Gastos"
               amount={totalExpenses}
               color="#e74c3c"
            />

            <SummaryCard
               title="Saldo"
               amount={balance}
               color={balance >= 0 ? '#3498db' : '#e67e22'}
            />
         </section>

         <hr style={{ margin: '24px 0' }} />

         {/* AÇÕES RÁPIDAS */}
         <section style={{ display: 'grid', gap: 12 }}>
            <h2>Ações rápidas</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <button onClick={() => navigate('/incomes')}>
                  ➕ Receitas
               </button>

               <button onClick={() => navigate('/expenses')}>
                  ➖ Gastos
               </button>

               <button onClick={() => navigate('/commitments')}>
                  📅 Compromissos
               </button>

               <button disabled>
                  📊 Dashboard (em breve)
               </button>
            </div>
         </section>
      </div>
   );
}

function SummaryCard(props: {
   title: string;
   amount: number;
   color: string;
}) {
   return (
      <div
         style={{
            padding: 16,
            borderRadius: 8,
            background: '#f5f5f5',
            borderLeft: `6px solid ${props.color}`
         }}
      >
         <strong>{props.title}</strong>
         <h2 style={{ margin: '8px 0' }}>
            R$ {props.amount.toFixed(2)}
         </h2>
      </div>
   );
}