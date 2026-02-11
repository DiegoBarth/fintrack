import { describe, it, expect } from 'vitest'
import { sanitizeText } from '@/utils/sanitizers'

describe('sanitization', () => {
   describe('sanitizeText', () => {
      it('should remove leading and trailing extra spaces', () => {
         expect(sanitizeText('  Test  ')).toBe('Test')
      })

      it('should normalize multiple spaces', () => {
         expect(sanitizeText('Test    with    spaces')).toBe('Test with spaces')
      })

      it('should handle empty strings', () => {
         expect(sanitizeText('')).toBe('')
      })

      it('should handle strings with only spaces', () => {
         expect(sanitizeText('     ')).toBe('')
      })

      it('should preserve already normalized text', () => {
         expect(sanitizeText('Normal text')).toBe('Normal text')
      })

      it('should remove extra line breaks', () => {
         expect(sanitizeText('Text\n\nwith\n\nbreaks')).toBe('Text with breaks')
      })

      it('should handle mixed tabs and spaces', () => {
         expect(sanitizeText('Text\t\twith\t\ttabs')).toBe('Text with tabs')
      })
   })
})