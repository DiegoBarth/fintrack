import { useNavigate } from 'react-router-dom';
import { usePeriod } from '../contexts/PeriodContext';
import { MonthlySummary } from '../components/home/MonthlySummary';

export function Home() {
   const navigate = useNavigate();
   const { month, setMonth, year, setYear } = usePeriod();

   const months = [
      { value: 'all', label: 'Ano inteiro' },
      { value: '1', label: 'Janeiro' },
      { value: '2', label: 'Fevereiro' },
      { value: '3', label: 'Março' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Maio' },
      { value: '6', label: 'Junho' },
      { value: '7', label: 'Julho' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Setembro' },
      { value: '10', label: 'Outubro' },
      { value: '11', label: 'Novembro' },
      { value: '12', label: 'Dezembro' },
   ];

   return (
      <div style={{ padding: 16 }}>
         <h1>Home</h1>

         <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <select value={month} onChange={e => setMonth(e.target.value)}>
               {months.map(m => (
                  <option key={m.value} value={m.value}>
                     {m.label}
                  </option>
               ))}
            </select>

            <input
               type="number"
               value={year}
               onChange={e => setYear(Number(e.target.value))}
            />
         </div>

         <MonthlySummary />

         <hr style={{ margin: '24px 0' }} />

         <section style={{ display: 'grid', gap: 12 }}>
            <h2>Ações rápidas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <button onClick={() => navigate('/incomes')}>➕ Receitas</button>
               <button onClick={() => navigate('/expenses')}>➖ Gastos</button>
               <button onClick={() => navigate('/commitments')}>📅 Compromissos</button>
               <button onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
            </div>
         </section>
      </div>
   );
}