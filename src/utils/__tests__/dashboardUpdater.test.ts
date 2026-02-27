import { describe, it, expect } from 'vitest'
import type { Dashboard } from '@/types/Dashboard'
import {
  updateMonthlyBalance,
  addCategory,
  updateCategory,
  removeCategory,
  updateCard,
  addCardPurchase,
  removeCardPurchase
} from '../dashboardUpdater'

describe('dashboardUpdater', () => {
  describe('updateMonthlyBalance', () => {
    it('should add a positive value to the existing balance', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [
          { date: '2026-01', balance: 1000 },
          { date: '2026-02', balance: 2000 }
        ],
        topCategories: [],
        cardsSummary: []
      }

      const result = updateMonthlyBalance(dashboard, 0, 500)

      expect(result.monthlyBalance[0].balance).toBe(1500)
      expect(result.monthlyBalance[1].balance).toBe(2000) // Should not change other months
    })

    it('should subtract a negative value from the balance', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [{ date: '2026-01', balance: 1000 }],
        topCategories: [],
        cardsSummary: []
      }

      const result = updateMonthlyBalance(dashboard, 0, -300)

      expect(result.monthlyBalance[0].balance).toBe(700)
    })

    it('should not change other months', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [
          { date: '2026-01', balance: 1000 },
          { date: '2026-02', balance: 2000 },
          { date: '2026-03', balance: 3000 }
        ],
        topCategories: [],
        cardsSummary: []
      }

      const result = updateMonthlyBalance(dashboard, 1, 100)

      expect(result.monthlyBalance[0].balance).toBe(1000)
      expect(result.monthlyBalance[1].balance).toBe(2100)
      expect(result.monthlyBalance[2].balance).toBe(3000)
    })
  })

  describe('addCategory', () => {
    it('should create a new category when it does not exist', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = addCategory(dashboard, 'Transport', 300)

      expect(result.topCategories).toHaveLength(2)
      expect(result.topCategories[1]).toEqual({
        category: 'Transport',
        total: 300
      })
    })

    it('should add value to an existing category', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = addCategory(dashboard, 'Food', 200)

      expect(result.topCategories).toHaveLength(1)
      expect(result.topCategories[0].total).toBe(700)
    })

    it('should preserve other categories', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 },
          { category: 'Transport', total: 300 }
        ],
        cardsSummary: []
      }

      const result = addCategory(dashboard, 'Food', 100)

      expect(result.topCategories).toHaveLength(2)
      expect(result.topCategories[0].total).toBe(600)
      expect(result.topCategories[1].total).toBe(300)
    })
  })

  describe('updateCategory', () => {
    it('should add a positive difference', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = updateCategory(dashboard, 'Food', 100)

      expect(result.topCategories[0].total).toBe(600)
    })

    it('should subtract a negative difference', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = updateCategory(dashboard, 'Food', -200)

      expect(result.topCategories[0].total).toBe(300)
    })

    it('should not change non-existent category', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = updateCategory(dashboard, 'Transport', 100)

      expect(result.topCategories).toHaveLength(1)
      expect(result.topCategories[0].total).toBe(500)
    })
  })

  describe('removeCategory', () => {
    it('should subtract value from category', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = removeCategory(dashboard, 'Food', 200)

      expect(result.topCategories[0].total).toBe(300)
    })

    it('should remove category when total reaches zero', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = removeCategory(dashboard, 'Food', 500)

      expect(result.topCategories).toHaveLength(0)
    })

    it('should remove category when total becomes negative', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 }
        ],
        cardsSummary: []
      }

      const result = removeCategory(dashboard, 'Food', 600)

      expect(result.topCategories).toHaveLength(0)
    })

    it('should preserve other categories', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [
          { category: 'Food', total: 500 },
          { category: 'Transport', total: 300 }
        ],
        cardsSummary: []
      }

      const result = removeCategory(dashboard, 'Food', 500)

      expect(result.topCategories).toHaveLength(1)
      expect(result.topCategories[0].category).toBe('Transport')
    })
  })

  describe('updateCard', () => {
    it('should adjust card statement', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 8000,
            usedPercentage: 20,
            statementTotal: 2000
          }
        ]
      }

      const result = updateCard(dashboard, 'Bradesco', 500, 0)

      expect(result.cardsSummary[0].statementTotal).toBe(2500)
    })

    it('should adjust available limit', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 8000,
            usedPercentage: 20,
            statementTotal: 2000
          }
        ]
      }

      const result = updateCard(dashboard, 'Bradesco', 0, -1000)

      expect(result.cardsSummary[0].availableLimit).toBe(7000)
    })

    it('should recalculate used percentage', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 8000,
            usedPercentage: 20,
            statementTotal: 2000
          }
        ]
      }

      const result = updateCard(dashboard, 'Bradesco', 0, -3000)

      expect(result.cardsSummary[0].availableLimit).toBe(5000)
      expect(result.cardsSummary[0].usedPercentage).toBe(50)
    })

    it('should not change other cards', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 8000,
            usedPercentage: 20,
            statementTotal: 2000
          },
          {
            cardName: 'Itaú',
            image: 'itau.png',
            totalLimit: 5000,
            availableLimit: 4000,
            usedPercentage: 20,
            statementTotal: 1000
          }
        ]
      }

      const result = updateCard(dashboard, 'Bradesco', 500, 0)

      expect(result.cardsSummary[0].statementTotal).toBe(2500)
      expect(result.cardsSummary[1].statementTotal).toBe(1000)
    })
  })

  describe('addCardPurchase', () => {
    it('should add installment to statement and deduct from total limit', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 10000,
            usedPercentage: 0,
            statementTotal: 0
          }
        ]
      }

      const result = addCardPurchase(dashboard, 'Bradesco', 1500, 15000)

      expect(result.cardsSummary[0].statementTotal).toBe(1500) // Monthly installment
      expect(result.cardsSummary[0].availableLimit).toBe(-5000) // Deducts total value
    })

    it('should calculate used percentage correctly', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 10000,
            usedPercentage: 0,
            statementTotal: 0
          }
        ]
      }

      const result = addCardPurchase(dashboard, 'Bradesco', 500, 5000)

      expect(result.cardsSummary[0].usedPercentage).toBe(50)
    })
  })

  describe('removeCardPurchase', () => {
    it('should remove installment from statement', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 5000,
            usedPercentage: 50,
            statementTotal: 1500
          }
        ]
      }

      const result = removeCardPurchase(dashboard, 'Bradesco', 1500, false)

      expect(result.cardsSummary[0].statementTotal).toBe(0)
    })

    it('should release limit if not yet paid', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 5000,
            usedPercentage: 50,
            statementTotal: 1500
          }
        ]
      }

      const result = removeCardPurchase(dashboard, 'Bradesco', 1500, false)

      expect(result.cardsSummary[0].availableLimit).toBe(6500)
    })

    it('should not release limit if already paid', () => {
      const dashboard: Dashboard = {
        monthlyBalance: [],
        topCategories: [],
        cardsSummary: [
          {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 10000,
            availableLimit: 5000,
            usedPercentage: 50,
            statementTotal: 1500
          }
        ]
      }

      const result = removeCardPurchase(dashboard, 'Bradesco', 1500, true)

      expect(result.cardsSummary[0].availableLimit).toBe(5000)
    })
  })

  const dashboard: Dashboard = {
    monthlyBalance: [],
    topCategories: [],
    cardsSummary: [
      {
        cardName: 'Existing Card',
        image: 'card.png',
        totalLimit: 1000,
        availableLimit: 1000,
        usedPercentage: 0,
        statementTotal: 0
      }
    ]
  }

  it('should return card unchanged in updateCard if name does not match', () => {
    const result = updateCard(dashboard, 'Non-existent Card', 100, 0)
    expect(result.cardsSummary[0].statementTotal).toBe(0)
    expect(result.cardsSummary).toEqual(dashboard.cardsSummary)
  })

  it('should return card unchanged in addCardPurchase if name does not match', () => {
    const result = addCardPurchase(dashboard, 'Non-existent Card', 100, 500)
    expect(result.cardsSummary).toEqual(dashboard.cardsSummary)
  })

  it('should return card unchanged in removeCardPurchase if name does not match', () => {
    const result = removeCardPurchase(dashboard, 'Non-existent Card', 100, false)
    expect(result.cardsSummary).toEqual(dashboard.cardsSummary)
  })
})