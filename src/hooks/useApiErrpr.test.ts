
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useApiError } from '@/hooks/useApiError'

const mockError = vi.fn()
const mockWarning = vi.fn()
const mockSuccess = vi.fn()

vi.mock('@/contexts/toast', () => ({
   useToast: () => ({
      error: mockError,
      warning: mockWarning,
      success: mockSuccess,
   }),
}))

describe('useApiError', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('Network Errors', () => {
      it('should handle fetch/connection errors', () => {
         const { result } = renderHook(() => useApiError())

         const networkError = new TypeError('fetch failed')
         result.current.handleError(networkError)

         expect(mockError).toHaveBeenCalledWith('Erro de conexão com o servidor')
      })

      it('should handle other TypeErrors', () => {
         const { result } = renderHook(() => useApiError())

         const typeError = new TypeError('Cannot read property')
         result.current.handleError(typeError)

         expect(mockError).toHaveBeenCalled()
      })
   })

   describe('Structured HTTP Errors (JSON)', () => {
      it('should handle errors with structured JSON', () => {
         const { result } = renderHook(() => useApiError())

         const apiError = new Error(JSON.stringify({
            statusCode: 400,
            message: 'Dados inválidos',
         }))

         result.current.handleError(apiError)

         expect(mockError).toHaveBeenCalledWith('Dados inválidos')
      })

      it('should use default message if JSON has no message property', () => {
         const { result } = renderHook(() => useApiError())

         const apiError = new Error(JSON.stringify({
            statusCode: 400,
         }))

         result.current.handleError(apiError)

         expect(mockError).toHaveBeenCalledWith('Erro ao processar requisição')
      })
   })

   describe('HTTP Errors by Status Code (String)', () => {
      it('should handle 401 (Unauthorized) error', () => {
         const { result } = renderHook(() => useApiError())

         const authError = new Error('Request failed with status 401')
         result.current.handleError(authError)

         expect(mockError).toHaveBeenCalledWith('Sessão expirada. Faça login novamente')
      })

      it('should handle Unauthorized error by keyword', () => {
         const { result } = renderHook(() => useApiError())

         const authError = new Error('Unauthorized access')
         result.current.handleError(authError)

         expect(mockError).toHaveBeenCalledWith('Sessão expirada. Faça login novamente')
      })

      it('should handle 403 (Forbidden) error', () => {
         const { result } = renderHook(() => useApiError())

         const forbiddenError = new Error('Request failed with status 403')
         result.current.handleError(forbiddenError)

         expect(mockError).toHaveBeenCalledWith('Você não tem permissão para realizar esta ação')
      })

      it('should handle 404 (Not Found) error', () => {
         const { result } = renderHook(() => useApiError())

         const notFoundError = new Error('Request failed with status 404')
         result.current.handleError(notFoundError)

         expect(mockError).toHaveBeenCalledWith('Recurso não encontrado')
      })

      it('should handle 500 (Internal Server Error)', () => {
         const { result } = renderHook(() => useApiError())

         const serverError = new Error('Request failed with status 500')
         result.current.handleError(serverError)

         expect(mockError).toHaveBeenCalledWith('Erro no servidor. Tente novamente mais tarde')
      })

      it('should handle Internal error by keyword', () => {
         const { result } = renderHook(() => useApiError())

         const serverError = new Error('Internal Server Error')
         result.current.handleError(serverError)

         expect(mockError).toHaveBeenCalledWith('Erro no servidor. Tente novamente mais tarde')
      })
   })

   describe('Generic Errors', () => {
      it('should handle Error with custom message', () => {
         const { result } = renderHook(() => useApiError())

         const customError = new Error('Erro customizado específico')
         result.current.handleError(customError)

         expect(mockError).toHaveBeenCalledWith('Erro customizado específico')
      })

      it('should handle non-Error objects by converting to string', () => {
         const { result } = renderHook(() => useApiError())

         const unknownError = { status: 'error', code: 'UNKNOWN' }
         result.current.handleError(unknownError)

         expect(mockError).toHaveBeenCalled()
      })

      it('should handle null as an error', () => {
         const { result } = renderHook(() => useApiError())

         result.current.handleError(null)

         expect(mockError).toHaveBeenCalled()
      })

      it('should handle undefined as an error', () => {
         const { result } = renderHook(() => useApiError())

         result.current.handleError(undefined)

         expect(mockError).toHaveBeenCalled()
      })
   })
})