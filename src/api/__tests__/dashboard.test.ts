import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listDashboardData } from '@/api/endpoints/dashboard';
import { apiGet } from '@/api/client';
import type { Dashboard, CategorySummary, MonthlyBalanceHistory, CreditCardSummary } from '@/types/Dashboard';

// ---------------------- Mock do apiGet ----------------------
vi.mock('@/api/client', () => ({
  apiGet: vi.fn()
}));

const mockApiGet = vi.mocked(apiGet);

describe('listDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call apiGet with correct parameters', async () => {
    const mockResponse: Dashboard = {
      monthlyBalance: [],
      topCategories: [],
      cardsSummary: []
    };
    mockApiGet.mockResolvedValueOnce(mockResponse);

    const month = '02';
    const year = '2026';

    const result = await listDashboardData(month, year);

    expect(mockApiGet).toHaveBeenCalledWith({
      action: 'listDashboardData',
      month,
      year
    });

    expect(result).toEqual(mockResponse);
  });

  it('should return data correctly with proper types', async () => {
    const mockResponse: Dashboard = {
      monthlyBalance: [
        { date: '2026-02-01', balance: 1000 } as MonthlyBalanceHistory
      ],
      topCategories: [
        { category: 'Alimentação', total: 200 } as CategorySummary
      ],
      cardsSummary: [
        {
          cardName: 'Nubank',
          image: 'nubank.png',
          totalLimit: 1000,
          availableLimit: 500,
          usedPercentage: 50,
          statementTotal: 200
        } as CreditCardSummary
      ]
    };

    mockApiGet.mockResolvedValueOnce(mockResponse);

    const result = await listDashboardData('02', '2026');

    expect(result).toEqual(mockResponse);
    expect(result.monthlyBalance[0].date).toBe('2026-02-01');
    expect(result.topCategories[0].category).toBe('Alimentação');
    expect(result.cardsSummary[0].cardName).toBe('Nubank');
  });

  it('should throw if apiGet rejects', async () => {
    const error = new Error('API Error');
    mockApiGet.mockRejectedValueOnce(error);

    await expect(listDashboardData('02', '2026')).rejects.toThrow('API Error');
  });
});