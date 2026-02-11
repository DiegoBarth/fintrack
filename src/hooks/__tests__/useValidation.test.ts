import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { z } from 'zod'
import { useValidation } from '@/hooks/useValidation'

// Mock of useToast
vi.mock('@/contexts/toast', () => ({
   useToast: () => ({
      warning: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
   }),
}))

describe('useValidation', () => {
   const TestSchema = z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      age: z.number().min(18, 'Must be of legal age'),
      email: z.string().email('Invalid email'),
   })

   beforeEach(() => {
      vi.clearAllMocks()
   })

   it('should return validated data when schema is valid', () => {
      const { result } = renderHook(() => useValidation())

      const data = {
         name: 'John Doe',
         age: 25,
         email: 'john@example.com',
      }

      const outcome = result.current.validate(TestSchema, data)

      expect(outcome).toEqual(data)
   })

   it('should return null when validation fails', () => {
      const { result } = renderHook(() => useValidation())

      const data = {
         name: 'Jo', // too short
         age: 15, // underage
         email: 'invalid', // invalid email
      }

      const outcome = result.current.validate(TestSchema, data)

      expect(outcome).toBeNull()
   })

   it('should validate a simple string schema', () => {
      const { result } = renderHook(() => useValidation())

      const StringSchema = z.string().min(1, 'Required field')

      const outcome = result.current.validate(StringSchema, 'Valid text')

      expect(outcome).toBe('Valid text')
   })

   it('should return null for empty string in a required schema', () => {
      const { result } = renderHook(() => useValidation())

      const StringSchema = z.string().min(1, 'Required field')
      const outcome = result.current.validate(StringSchema, '')

      expect(outcome).toBeNull()
   })

   it('should validate numbers correctly', () => {
      const { result } = renderHook(() => useValidation())

      const NumberSchema = z.number().positive('Must be positive')

      const outcome = result.current.validate(NumberSchema, 100)

      expect(outcome).toBe(100)
   })

   it('should reject negative numbers when schema requires positive', () => {
      const { result } = renderHook(() => useValidation())

      const NumberSchema = z.number().positive('Must be positive')

      const outcome = result.current.validate(NumberSchema, -10)

      expect(outcome).toBeNull()
   })

   it('should validate partial objects with optional fields', () => {
      const { result } = renderHook(() => useValidation())

      const PartialSchema = z.object({
         required: z.string().min(1),
         optional: z.string().optional(),
      })

      const data = {
         required: 'value',
      }

      const outcome = result.current.validate(PartialSchema, data)

      expect(outcome).toEqual({ required: 'value' })
   })
})