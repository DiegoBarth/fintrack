import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyEmailAuthorization, fetchFullSummary, fetchAllData, AppData } from '@/api/endpoints/home';
import { apiGet } from '@/api/client';
import type { Commitment } from '@/types/Commitment';
import type { Expense } from '@/types/Expense';
import type { Income } from '@/types/Income';
import type { FullSummary } from '@/types/FullSummary';

// Mock do apiGet
vi.mock('@/api/client', () => ({
  apiGet: vi.fn()
}));

const mockApiGet = vi.mocked(apiGet);

describe('App API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifyEmailAuthorization calls apiGet with correct params', async () => {
    const mockResponse = { authorized: true };
    mockApiGet.mockResolvedValueOnce(mockResponse);

    const email = 'test@example.com';
    const result = await verifyEmailAuthorization(email);

    expect(mockApiGet).toHaveBeenCalledWith({
      acao: 'verifyEmailAuthorization',
      email
    });
    expect(result).toEqual(mockResponse);
  });

  it('fetchFullSummary calls apiGet with correct params and returns data', async () => {
    const mockResponse: FullSummary = {
      totalIncomes: 5000,
      totalExpenses: 3000,
      totalCommitments: 1500,
      totalReceivedAmount: 4500,
      totalPaidExpenses: 2500,
      totalPaidCommitments: 1200,
      totalReceivedInMonth: 2000,
      totalPaidExpensesInMonth: 1000,
      totalPaidCommitmentsInMonth: 600,
      accumulatedBalanceFromPreviousMonth: 41,
      availableYears: [2024, 2025, 2026]
    };
    mockApiGet.mockResolvedValueOnce(mockResponse);

    const month = '02';
    const year = '2026';
    const result = await fetchFullSummary(month, year);

    expect(mockApiGet).toHaveBeenCalledWith({
      action: 'getFullSummary',
      month,
      year
    });
    expect(result).toEqual(mockResponse);
  });

  it('fetchAllData calls apiGet with correct params and returns realistic AppData', async () => {
    const mockResponse: AppData = {
      commitments: [
        {
          rowIndex: 1,
          description: 'Mercado',
          category: 'Alimentação',
          type: 'Fixo',
          amount: 200,
          dueDate: '2026-02-10',
          paymentDate: '2026-02-10',
          referenceMonth: '2026-02'
        },
        {
          rowIndex: 2,
          description: 'Gasolina',
          category: 'Transporte',
          type: 'Variável',
          amount: 150,
          dueDate: '2026-02-15',
          referenceMonth: '2026-02'
        },
        {
          rowIndex: 3,
          description: 'Assinatura Netflix',
          category: 'Serviços',
          type: 'Cartão',
          amount: 50,
          dueDate: '2026-02-05',
          card: 'Nubank',
          paymentDate: undefined,
          referenceMonth: '2026-02'
        }
      ] as Commitment[],
      incomes: [
        {
          rowIndex: 1,
          description: 'Salário',
          expectedDate: '2026-02-05',
          receivedDate: '2026-02-05',
          referenceMonth: '2026-02',
          amount: 3000
        },
        {
          rowIndex: 2,
          description: 'Freelance',
          expectedDate: '2026-02-20',
          receivedDate: undefined,
          referenceMonth: '2026-02',
          amount: 500
        }
      ] as Income[],
      expenses: [
        {
          rowIndex: 1,
          description: 'Transporte público',
          category: 'Transporte',
          amount: 100,
          paymentDate: '2026-02-02'
        },
        {
          rowIndex: 2,
          description: 'Aluguel',
          category: 'Moradia',
          amount: 1200,
          paymentDate: '2026-02-03'
        }
      ] as Expense[]
    };
    mockApiGet.mockResolvedValueOnce(mockResponse);

    const month = '02';
    const year = '2026';
    const result = await fetchAllData(month, year);

    expect(mockApiGet).toHaveBeenCalledWith({
      action: 'fetchAllData',
      month,
      year
    });
    expect(result).toEqual(mockResponse);
  });

  it('handles apiGet rejection in verifyEmailAuthorization', async () => {
    const error = new Error('API Error');
    mockApiGet.mockRejectedValueOnce(error);

    await expect(verifyEmailAuthorization('test@example.com')).rejects.toThrow('API Error');
  });

  it('handles apiGet rejection in fetchFullSummary', async () => {
    const error = new Error('API Error');
    mockApiGet.mockRejectedValueOnce(error);

    await expect(fetchFullSummary('02', '2026')).rejects.toThrow('API Error');
  });

  it('handles apiGet rejection in fetchAllData', async () => {
    const error = new Error('API Error');
    mockApiGet.mockRejectedValueOnce(error);

    await expect(fetchAllData('02', '2026')).rejects.toThrow('API Error');
  });
});