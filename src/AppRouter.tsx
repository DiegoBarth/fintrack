import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Income } from '@/pages/Income';
import { Expense } from '@/pages/Expense';
import { Commitment } from './pages/Commitment';
import { Dashboard } from '@/pages/Dashboard';

interface AppRouterProps {
   onLogout: () => void;
}

export function AppRouter({ onLogout }: AppRouterProps) {
   return (
      <Routes>
         <Route path="/" element={<Home onLogout={onLogout} />} />
         <Route path="/expenses" element={<Expense />} />
         <Route path="/commitments" element={<Commitment />} />
         <Route path="/incomes" element={<Income />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="*" element={<Navigate to="/" />} />
      </Routes>
   );
}