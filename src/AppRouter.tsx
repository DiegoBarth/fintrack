import { Routes, Route, Navigate } from 'react-router-dom';
import { SwipeLayout } from '@/components/layout/SwipeLayout'

import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const Income = lazy(() => import('@/pages/Income'));
const Expense = lazy(() => import('@/pages/Expense'));
const Commitment = lazy(() => import('@/pages/Commitment'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

interface AppRouterProps {
  onLogout: () => void
}

export default function AppRouter({ onLogout }: AppRouterProps) {
  return (
    <Routes>
      <Route element={<SwipeLayout />}>
        <Route path="/" element={
          <Suspense fallback={<div>Carregando...</div>}><Home onLogout={onLogout} /></Suspense>
        } />
        <Route path="/incomes" element={
          <Suspense fallback={<div>Carregando...</div>}><Income /></Suspense>
        } />
        <Route path="/expenses" element={
          <Suspense fallback={<div>Carregando...</div>}><Expense /></Suspense>
        } />
        <Route path="/commitments" element={
          <Suspense fallback={<div>Carregando...</div>}><Commitment /></Suspense>
        } />
        <Route path="/dashboard" element={
          <Suspense fallback={<div>Carregando...</div>}><Dashboard /></Suspense>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}