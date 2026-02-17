import { describe, it, expect } from 'vitest'
import type { Dashboard } from '@/types/Dashboard'
import type { Commitment } from '@/types/Commitment'
import type { Expense } from '@/types/Expense'
import type { Income } from '@/types/Income'
import {
   updateDashboardAfterCreateCommitment,
   updateDashboardAfterEditCommitment,
   updateDashboardAfterDeleteCommitment,
   updateDashboardAfterCreateExpense,
   updateDashboardAfterEditExpense,
   updateDashboardAfterDeleteExpense,
   updateDashboardAfterCreateIncome,
   updateDashboardAfterEditIncome,
   updateDashboardAfterDeleteIncome
} from '@/services/dashboardService'

describe('dashboardService - Commitments', () => {
   const baseDashboard: Dashboard = {
      monthlyBalance: [{ date: '2026-01', balance: 10000 }],
      topCategories: [{ category: 'Alimentação', total: 1000 }],
      cardsSummary: [
         {
            cardName: 'Bradesco',
            image: 'bradesco.png',
            totalLimit: 30000,
            availableLimit: 30000,
            usedPercentage: 0,
            statementTotal: 0
         }
      ]
   }

   describe('updateDashboardAfterCreateCommitment', () => {
      it('should add category when creating commitment', () => {
         const commitment: Commitment = {
            rowIndex: 1,
            description: 'Mensalidade',
            category: 'Educação',
            type: 'Fixo',
            amount: 500,
            dueDate: '2026-01-15'
         }

         const result = updateDashboardAfterCreateCommitment(
            baseDashboard,
            commitment,
            0
         )

         expect(result.topCategories).toHaveLength(2)
         expect(result.topCategories[1]).toEqual({
            category: 'Educação',
            total: 500
         })
      })

      it('should add to existing category', () => {
         const commitment: Commitment = {
            rowIndex: 1,
            description: 'Mercado',
            category: 'Alimentação',
            type: 'Variável',
            amount: 300,
            dueDate: '2026-01-15'
         }

         const result = updateDashboardAfterCreateCommitment(
            baseDashboard,
            commitment,
            0
         )

         expect(result.topCategories).toHaveLength(1)
         expect(result.topCategories[0].total).toBe(1300)
      })

      it('should be deducter the total limit for installment credit card purchases.', () => {
         const commitment: Commitment = {
            rowIndex: 1,
            description: 'Notebook',
            category: 'Eletrônicos',
            type: 'Cartão',
            amount: 1500,
            dueDate: '2026-01-15',
            card: 'Bradesco',
            installment: 1,
            totalInstallments: 10
         }

         const result = updateDashboardAfterCreateCommitment(
            baseDashboard,
            commitment,
            0
         )

         expect(result.cardsSummary[0].statementTotal).toBe(1500)
         expect(result.cardsSummary[0].availableLimit).toBe(15000)
      })
   })

   describe('updateDashboardAfterEditCommitment', () => {
      it('should update balance when marking as paid', () => {
         const oldCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '2026-01-10'
         }

         const result = updateDashboardAfterEditCommitment(
            baseDashboard,
            oldCommitment,
            2000,
            '2026-01-10',
            0
         )

         expect(result.monthlyBalance[0].balance).toBe(8000) // 10000 - 2000
      })

      it('should return balance when unmarking payment', () => {
         const dashboardWithPayment = {
            ...baseDashboard,
            monthlyBalance: [{ date: '2026-01', balance: 8000 }]
         }

         const oldCommitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '2026-01-10',
            paymentDate: '2026-01-10'
         }

         const result = updateDashboardAfterEditCommitment(
            dashboardWithPayment,
            oldCommitment,
            2000,
            undefined,
            0
         )

         expect(result.monthlyBalance[0].balance).toBe(10000) // 8000 + 2000
      })

      describe('card (cartão) – statement (fatura) and limit', () => {
         const dashboardWithCard: Dashboard = {
            ...baseDashboard,
            cardsSummary: [
               {
                  cardName: 'Bradesco',
                  image: 'bradesco.png',
                  totalLimit: 30000,
                  availableLimit: 28500,
                  usedPercentage: 5,
                  statementTotal: 1500
               }
            ]
         }

         it('no payment → paid, same value: fatura unchanged, frees limit by amount paid', () => {
            const oldCommitment: Commitment = {
               rowIndex: 1,
               description: 'Parcela',
               category: 'Casa',
               type: 'Cartão',
               amount: 1500,
               dueDate: '2026-01-15',
               card: 'Bradesco',
               installment: 1,
               totalInstallments: 10
            }

            const result = updateDashboardAfterEditCommitment(
               dashboardWithCard,
               oldCommitment,
               1500,
               '2026-01-15',
               0
            )

            expect(result.cardsSummary[0].statementTotal).toBe(1500)
            expect(result.cardsSummary[0].availableLimit).toBe(30000)
         })

         it('no payment → paid, value increased: fatura adjusts by difference, frees limit by amount paid (old value)', () => {
            const oldCommitment: Commitment = {
               rowIndex: 1,
               description: 'Parcela',
               category: 'Casa',
               type: 'Cartão',
               amount: 500,
               dueDate: '2026-01-15',
               card: 'Bradesco',
               installment: 1,
               totalInstallments: 11
            }

            const dashboardWithCard11x: Dashboard = {
               ...baseDashboard,
               cardsSummary: [
                  {
                     cardName: 'Bradesco',
                     image: 'bradesco.png',
                     totalLimit: 32870,
                     availableLimit: 27370,
                     usedPercentage: 17,
                     statementTotal: 500
                  }
               ]
            }

            const result = updateDashboardAfterEditCommitment(
               dashboardWithCard11x,
               oldCommitment,
               5000,
               '2026-01-15',
               0
            )

            expect(result.cardsSummary[0].statementTotal).toBe(5000)
            expect(result.cardsSummary[0].availableLimit).toBe(27870)
         })

         it('no payment → paid, value decreased: fatura adjusts by difference, frees limit by amount paid (old value)', () => {
            const oldCommitment: Commitment = {
               rowIndex: 1,
               description: 'Parcela',
               category: 'Casa',
               type: 'Cartão',
               amount: 1500,
               dueDate: '2026-01-15',
               card: 'Bradesco',
               installment: 1,
               totalInstallments: 10
            }

            const result = updateDashboardAfterEditCommitment(
               dashboardWithCard,
               oldCommitment,
               1000,
               '2026-01-15',
               0
            )

            expect(result.cardsSummary[0].statementTotal).toBe(1000)
            expect(result.cardsSummary[0].availableLimit).toBe(30000)
         })

         it('had payment → no payment: fatura unchanged (difference 0), uses limit again by that amount', () => {
            const dashboardPaid = {
               ...baseDashboard,
               cardsSummary: [
                  {
                     cardName: 'Bradesco',
                     image: 'bradesco.png',
                     totalLimit: 30000,
                     availableLimit: 30000,
                     usedPercentage: 0,
                     statementTotal: 0
                  }
               ]
            }

            const oldCommitment: Commitment = {
               rowIndex: 1,
               description: 'Parcela',
               category: 'Casa',
               type: 'Cartão',
               amount: 1500,
               dueDate: '2026-01-15',
               card: 'Bradesco',
               paymentDate: '2026-01-15',
               installment: 1,
               totalInstallments: 10
            }

            const result = updateDashboardAfterEditCommitment(
               dashboardPaid,
               oldCommitment,
               1500,
               undefined,
               0
            )

            expect(result.cardsSummary[0].statementTotal).toBe(0)
            expect(result.cardsSummary[0].availableLimit).toBe(28500)
         })

         it('both unpaid, value changed (one parcel 500→5000): fatura +4500, limit -4500 (one parcel only)', () => {
            const dashboard11x = {
               ...baseDashboard,
               cardsSummary: [
                  {
                     cardName: 'Bradesco',
                     image: 'bradesco.png',
                     totalLimit: 32870,
                     availableLimit: 27370,
                     usedPercentage: 17,
                     statementTotal: 5500
                  }
               ]
            }

            const oldCommitment: Commitment = {
               rowIndex: 1,
               description: 'Parcela',
               category: 'Casa',
               type: 'Cartão',
               amount: 500,
               dueDate: '2026-01-15',
               card: 'Bradesco',
               installment: 1,
               totalInstallments: 11
            }

            const result = updateDashboardAfterEditCommitment(
               dashboard11x,
               oldCommitment,
               5000,
               undefined,
               0
            )

            expect(result.cardsSummary[0].statementTotal).toBe(10000)
            expect(result.cardsSummary[0].availableLimit).toBe(22870)
         })

         it('had payment, still paid, value changed: fatura adjusts by difference, limit unchanged', () => {
            const dashboardOnePaid = {
               ...baseDashboard,
               cardsSummary: [
                  {
                     cardName: 'Bradesco',
                     image: 'bradesco.png',
                     totalLimit: 32870,
                     availableLimit: 27870,
                     usedPercentage: 15,
                     statementTotal: 5500
                  }
               ]
            }

            const oldCommitment: Commitment = {
               rowIndex: 1,
               description: 'Parcela',
               category: 'Casa',
               type: 'Cartão',
               amount: 5000,
               dueDate: '2026-01-15',
               card: 'Bradesco',
               paymentDate: '2026-01-15',
               installment: 1,
               totalInstallments: 11
            }

            const result = updateDashboardAfterEditCommitment(
               dashboardOnePaid,
               oldCommitment,
               500,
               '2026-01-15',
               0
            )

            expect(result.cardsSummary[0].statementTotal).toBe(1000)
            expect(result.cardsSummary[0].availableLimit).toBe(27870)
         })
      })
   })

   describe('updateDashboardAfterDeleteCommitment', () => {
      it('should revert balance if it was paid', () => {
         const dashboardWithPayment = {
            ...baseDashboard,
            monthlyBalance: [{ date: '2026-01', balance: 8000 }]
         }

         const commitment: Commitment = {
            rowIndex: 1,
            description: 'Aluguel',
            category: 'Casa',
            type: 'Fixo',
            amount: 2000,
            dueDate: '2026-01-10',
            paymentDate: '2026-01-10'
         }

         const result = updateDashboardAfterDeleteCommitment(
            dashboardWithPayment,
            commitment,
            0
         )

         expect(result.monthlyBalance[0].balance).toBe(10000)
      })

      it('should release card limit on deletion', () => {
         const dashboardWithCard = {
            ...baseDashboard,
            cardsSummary: [
               {
                  cardName: 'Bradesco',
                  image: 'bradesco.png',
                  totalLimit: 30000,
                  availableLimit: 28500,
                  usedPercentage: 5,
                  statementTotal: 1500
               }
            ]
         }

         const commitment: Commitment = {
            rowIndex: 1,
            description: 'Compra',
            category: 'Compras',
            type: 'Cartão',
            amount: 1500,
            dueDate: '2026-01-15',
            card: 'Bradesco'
         }

         const result = updateDashboardAfterDeleteCommitment(
            dashboardWithCard,
            commitment,
            0
         )

         expect(result.cardsSummary[0].statementTotal).toBe(0)
      })
   })
})

describe('dashboardService - Expenses', () => {
   const baseDashboard: Dashboard = {
      monthlyBalance: [{ date: '2026-01', balance: 10000 }],
      topCategories: [],
      cardsSummary: []
   }

   describe('updateDashboardAfterCreateExpense', () => {
      it('should decrease balance and add category', () => {
         const expense: Expense = {
            rowIndex: 1,
            description: 'Uber',
            category: 'Transporte',
            amount: 50,
            paymentDate: '2026-01-15'
         }

         const result = updateDashboardAfterCreateExpense(
            baseDashboard,
            expense,
            0
         )

         expect(result.monthlyBalance[0].balance).toBe(9950)
         expect(result.topCategories[0]).toEqual({
            category: 'Transporte',
            total: 50
         })
      })
   })
})

describe('dashboardService - Incomes', () => {
   const baseDashboard: Dashboard = {
      monthlyBalance: [{ date: '2026-01', balance: 10000 }],
      topCategories: [],
      cardsSummary: []
   }

   describe('updateDashboardAfterCreateIncome', () => {
      it('should increase balance', () => {
         const result = updateDashboardAfterCreateIncome(
            baseDashboard,
            0,
            5000
         )

         expect(result.monthlyBalance[0].balance).toBe(15000)
      })
   })
})