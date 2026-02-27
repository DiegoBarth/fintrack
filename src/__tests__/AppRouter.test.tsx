import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import AppRouter from '../AppRouter';

let shouldShowPage = false;
let triggerUpdate: () => void = () => { };

vi.mock('@/components/layout/SwipeLayout', () => ({
  SwipeLayout: () => <div data-testid="swipe-layout"><Outlet /></div>,
}));

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children, title, onBack }: any) => (
    <div data-testid="layout-wrapper">
      <h1>{title}</h1>
      <button onClick={onBack} data-testid="back-button">Voltar</button>
      {children}
    </div>
  ),
}));

vi.mock('@/components/incomes/IncomeSkeleton', () => ({ IncomeSkeleton: () => <div /> }));
vi.mock('@/components/expenses/ExpenseSkeleton', () => ({ ExpenseSkeleton: () => <div /> }));
vi.mock('@/components/commitments/CommitmentSkeleton', () => ({ CommitmentSkeleton: () => <div /> }));
vi.mock('@/components/home/HomeFallback', () => ({
  HomeFallback: ({ onLogout }: any) => (
    <div>
      <span>Home Loading...</span>
      <button onClick={onLogout} data-testid="logout-btn">Logout</button>
    </div>
  )
}));

const createLazyMock = (testId: string, fallbackTitle?: string) => {
  return {
    default: () => {
      const [mounted, setMounted] = React.useState(false);

      React.useEffect(() => {
        triggerUpdate = () => setMounted(true);
      }, []);

      if (!mounted) {
        if (fallbackTitle) {
          return <div><h1>{fallbackTitle}</h1></div>;
        }
        return <div>Loading...</div>;
      }

      return <div data-testid={testId}>{testId} Page</div>;
    }
  };
};

vi.mock('@/pages/Income', () => createLazyMock('income-page'));
vi.mock('@/pages/Expense', () => createLazyMock('expense-page'));
vi.mock('@/pages/Commitment', () => createLazyMock('commitment-page'));
vi.mock('@/pages/Dashboard', () => ({ default: () => <div data-testid="dashboard-page">Dashboard</div> }));

describe('AppRouter Coverage', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    shouldShowPage = false;
    vi.clearAllMocks();
  });

  const renderRouter = (path: string) => render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter onLogout={mockOnLogout} />
    </MemoryRouter>
  );

  it('covers IncomeFallback and back navigation', async () => {
    renderRouter('/incomes');
    expect(await screen.findByText(/Receitas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('back-button'));
  });

  it('covers ExpenseFallback and back navigation', async () => {
    renderRouter('/expenses');
    expect(await screen.findByText(/Gastos/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('back-button'));
  });

  it('covers CommitmentFallback and back navigation', async () => {
    renderRouter('/commitments');
    expect(await screen.findByText(/Compromissos/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('back-button'));
  });

  it('covers HomeFallback and onLogout prop', async () => {
    renderRouter('/');

    expect(await screen.findByText(/Home Loading/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(mockOnLogout).toHaveBeenCalled();
  });
  it('covers Dashboard route and async loading', async () => {
    renderRouter('/dashboard');
    const dashboard = await screen.findByTestId('dashboard-page');
    expect(dashboard).toBeInTheDocument();
  });

  it('covers full flow: skeleton to page content', async () => {
    renderRouter('/incomes');

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await act(async () => {
      shouldShowPage = true;
      triggerUpdate();
    });

    await waitFor(() => {
      expect(screen.getByTestId('income-page')).toBeInTheDocument();
    });
  });
});