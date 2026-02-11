import { describe, it, expect } from 'vitest'
import {
   currencyToNumber,
   numberToCurrency,
   dateBRToISO,
   formatCurrency,
   formatDateBR,
   getMonthAndYear,
} from '@/utils/formatters'

describe('formatters', () => {
   describe('currencyToNumber', () => {
      it('should convert currency string with BRL symbol to number', () => {
         expect(currencyToNumber('R$ 1.234,56')).toBe(1234.56)
      })

      it('should convert currency without symbol to number', () => {
         expect(currencyToNumber('1.234,56')).toBe(1234.56)
      })

      it('should convert currency without thousands separator', () => {
         expect(currencyToNumber('1234,56')).toBe(1234.56)
      })

      it('should convert values with extra spaces', () => {
         expect(currencyToNumber('R$ 100,50')).toBe(100.5)
      })

      it('should return 0 for an empty string', () => {
         expect(currencyToNumber('')).toBe(0)
      })

      it('should convert large values', () => {
         expect(currencyToNumber('R$ 1.000.000,00')).toBe(1000000)
      })

      it('should convert cents correctly', () => {
         expect(currencyToNumber('R$ 0,99')).toBe(0.99)
      })
   })

   describe('numberToCurrency', () => {
      it('should format number to BRL currency string', () => {
         expect(numberToCurrency(1234.56).replace(/\u00A0/g, ' ')).toBe('R$ 1.234,56')
      })

      it('should format zero correctly', () => {
         expect(numberToCurrency(0).replace(/\u00A0/g, ' ')).toBe('R$ 0,00')
      })

      it('should format cents', () => {
         expect(numberToCurrency(0.99).replace(/\u00A0/g, ' ')).toBe('R$ 0,99')
      })

      it('should format large values', () => {
         expect(numberToCurrency(1000000).replace(/\u00A0/g, ' ')).toBe('R$ 1.000.000,00')
      })

      it('should accept a string as input', () => {
         expect(numberToCurrency('1234.56').replace(/\u00A0/g, ' ')).toBe('R$ 1.234,56')
      })

      it('should append decimal zeros', () => {
         expect(numberToCurrency(100).replace(/\u00A0/g, ' ')).toBe('R$ 100,00')
      })

      it('should round to 2 decimal places', () => {
         expect(numberToCurrency(10.999).replace(/\u00A0/g, ' ')).toBe('R$ 11,00')
      })
   })

   describe('dateBRToISO', () => {
      it('should convert BR date format to ISO', () => {
         expect(dateBRToISO('25/12/2025')).toBe('2025-12-25')
      })

      it('should pad day and month with leading zeros', () => {
         expect(dateBRToISO('1/1/2025')).toBe('2025-01-01')
      })

      it('should return an empty string for empty input', () => {
         expect(dateBRToISO('')).toBe('')
      })

      it('should convert end-of-year dates', () => {
         expect(dateBRToISO('31/12/2025')).toBe('2025-12-31')
      })

      it('should convert start-of-year dates', () => {
         expect(dateBRToISO('01/01/2025')).toBe('2025-01-01')
      })
   })

   describe('formatCurrency', () => {
      it('should format cents', () => {
         expect(formatCurrency('123').replace(/\u00A0/g, ' ')).toBe('R$ 1,23')
      })

      it('should format values with thousands separator', () => {
         expect(formatCurrency('123456').replace(/\u00A0/g, ' ')).toBe('R$ 1.234,56')
      })

      it('should format large values', () => {
         expect(formatCurrency('100000000').replace(/\u00A0/g, ' ')).toBe('R$ 1.000.000,00')
      })

      it('should ignore non-numeric characters', () => {
         expect(formatCurrency('R$ 123abc,45').replace(/\u00A0/g, ' ')).toBe('R$ 123,45');
         expect(formatCurrency('R$ 1,23').replace(/\u00A0/g, ' ')).toBe('R$ 1,23');
         expect(formatCurrency('abc123').replace(/\u00A0/g, ' ')).toBe('R$ 1,23');
      })

      it('should format zero', () => {
         expect(formatCurrency('0').replace(/\u00A0/g, ' ')).toBe('R$ 0,00')
      })

      it('should format one cent', () => {
         expect(formatCurrency('1').replace(/\u00A0/g, ' ')).toBe('R$ 0,01')
      })

      it('should format ten cents', () => {
         expect(formatCurrency('10').replace(/\u00A0/g, ' ')).toBe('R$ 0,10')
      })
   })

   describe('formatDateBR', () => {
      it('should format ISO date to BR format', () => {
         expect(formatDateBR('2025-12-25')).toBe('25/12/2025')
      })

      it('should add leading zeros to formatted date', () => {
         expect(formatDateBR('2025-01-01')).toBe('01/01/2025')
      })

      it('should format Date objects correctly', () => {
         const date = new Date('2025-12-25T12:00:00')
         expect(formatDateBR(date.toISOString().slice(0, 10))).toBe('25/12/2025')
      })

      it('should format end-of-year dates', () => {
         expect(formatDateBR('2025-12-31')).toBe('31/12/2025')
      })

      it('should format the first day of the year', () => {
         expect(formatDateBR('2026-01-01')).toBe('01/01/2026')
      })
   })

   describe('getMonthAndYear', () => {
      it('should extract month and year from BR date', () => {
         expect(getMonthAndYear('25/12/2025')).toEqual({ month: '12', year: '2025' })
      })

      it('should remove leading zero from the month', () => {
         expect(getMonthAndYear('01/01/2025')).toEqual({ month: '1', year: '2025' })
      })

      it('should work with months that have no leading zero', () => {
         expect(getMonthAndYear('15/3/2025')).toEqual({ month: '3', year: '2025' })
      })

      it('should extract December correctly', () => {
         expect(getMonthAndYear('31/12/2025')).toEqual({ month: '12', year: '2025' })
      })
   })
})