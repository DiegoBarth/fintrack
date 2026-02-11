import { Routes, Route, Navigate } from 'react-router-dom';
import { SwipeLayout } from '@/components/layout/SwipeLayout'
import { Home } from '@/pages/Home';
import { Income } from '@/pages/Income';
import { Expense } from '@/pages/Expense';
import { Commitment } from './pages/Commitment';
import { Dashboard } from '@/pages/Dashboard';

interface AppRouterProps {
   onLogout: () => void
}

export function AppRouter({ onLogout }: AppRouterProps) {
   return (
      <Routes>
         <Route element={<SwipeLayout />}>
            <Route path="/" element={<Home onLogout={onLogout} />} />
            <Route path="/incomes" element={<Income />} />
            <Route path="/expenses" element={<Expense />} />
            <Route path="/commitments" element={<Commitment />} />
            <Route path="/dashboard" element={<Dashboard />} />
         </Route>

         <Route path="*" element={<Navigate to="/" />} />
      </Routes>
   );
}