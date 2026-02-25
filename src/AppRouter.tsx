import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SwipeLayout } from '@/components/layout/SwipeLayout';
import { Layout } from '@/components/layout/Layout';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { HomeFallback } from '@/components/home/HomeFallback';

import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const Income = lazy(() => import('@/pages/Income'));
const Expense = lazy(() => import('@/pages/Expense'));
const Commitment = lazy(() => import('@/pages/Commitment'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

function IncomeFallback() {
  const navigate = useNavigate();
  return (
    <Layout title="Receitas" onBack={() => navigate('/')} headerVariant="income">
      <SkeletonList />
    </Layout>
  );
}

function ExpenseFallback() {
  const navigate = useNavigate();
  return (
    <Layout title="Gastos" onBack={() => navigate('/')} headerVariant="expense">
      <SkeletonList />
    </Layout>
  );
}

function CommitmentFallback() {
  const navigate = useNavigate();
  return (
    <Layout title="Compromissos" onBack={() => navigate('/')} headerVariant="commitment">
      <SkeletonList />
    </Layout>
  );
}

function DashboardFallback() {
  const navigate = useNavigate();
  return (
    <Layout title="Dashboard" onBack={() => navigate('/')} containerClassName="max-w-7xl">
      <DashboardSkeleton />
    </Layout>
  );
}

interface AppRouterProps {
  onLogout: () => void
}

export default function AppRouter({ onLogout }: AppRouterProps) {
  return (
    <Routes>
      <Route element={<SwipeLayout />}>
        <Route path="/" element={
          <Suspense fallback={<HomeFallback onLogout={onLogout} />}><Home onLogout={onLogout} /></Suspense>
        } />
        <Route path="/incomes" element={
          <Suspense fallback={<IncomeFallback />}><Income /></Suspense>
        } />
        <Route path="/expenses" element={
          <Suspense fallback={<ExpenseFallback />}><Expense /></Suspense>
        } />
        <Route path="/commitments" element={
          <Suspense fallback={<CommitmentFallback />}><Commitment /></Suspense>
        } />
        <Route path="/dashboard" element={
          <Suspense fallback={<DashboardFallback />}><Dashboard /></Suspense>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}