import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiGet, apiPost } from '@/api/client'

// Mock global fetch
globalThis.fetch = vi.fn()

describe('apiClient.ts - API HTTP Client', () => {
   beforeEach(() => {
      vi.clearAllMocks()
      vi.useFakeTimers()
   })

   afterEach(() => {
      vi.useRealTimers()
   })

   describe('apiGet', () => {
      it('should perform GET request with correct parameters', async () => {
         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ data: 'test' })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         const params = { action: 'list', month: '1', year: '2026' }
         const result = await apiGet(params)

         expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('action=list&month=1&year=2026'),
            expect.objectContaining({
               signal: expect.any(AbortSignal)
            })
         )
         expect(result).toEqual({ data: 'test' })
      })

      it('should throw error when response is not ok', async () => {
         const mockResponse = {
            ok: false,
            text: vi.fn().mockResolvedValue('Erro do servidor')
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         await expect(apiGet({ action: 'list' })).rejects.toThrow(
            'Erro do servidor'
         )
      })

      it('should throw timeout error when request takes too long', async () => {
         // Mock fetch that rejects with AbortError to simulate timeout
         const abortError = new Error('AbortError')
         abortError.name = 'AbortError'
         vi.mocked(fetch).mockRejectedValue(abortError)

         await expect(apiGet({ action: 'list' })).rejects.toThrow(
            'A requisição demorou demais. Tente novamente.'
         )
      })

      it('should throw connection error when fetch fails', async () => {
         vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'))

         await expect(apiGet({ action: 'list' })).rejects.toThrow(
            'Sem conexão. Verifique sua internet e tente novamente.'
         )
      })

      it('should throw generic error when rejection is not an Error instance', async () => {
         vi.mocked(fetch).mockRejectedValue('string error')

         await expect(apiGet({ action: 'list' })).rejects.toThrow(
            'Erro ao conectar com o servidor.'
         )
      })

      it('should throw error when response text is empty', async () => {
         const mockResponse = {
            ok: false,
            text: vi.fn().mockResolvedValue('')
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         await expect(apiGet({ action: 'list' })).rejects.toThrow('Erro na API')
      })
   })

   describe('apiPost', () => {
      it('should perform POST request with correct body', async () => {
         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         const body = { action: 'uniqueAction1', description: 'Test' }
         const result = await apiPost(body)

         expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
               method: 'POST',
               body: JSON.stringify(body)
            })
         )
         expect(result).toEqual({ success: true })
      })

      it('should apply rate limiting on consecutive POSTs', async () => {
         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         vi.setSystemTime(new Date('2026-02-07T10:00:00'))

         // First POST should work
         await apiPost({ action: 'rateLimitTest1', data: 'test1' })

         // Advance only 500ms (less than the 1000ms limit)
         vi.setSystemTime(new Date('2026-02-07T10:00:00.500'))

         // Second POST with same action should fail
         await expect(apiPost({ action: 'rateLimitTest1', data: 'test2' })).rejects.toThrow(
            'Aguarde um instante antes de enviar novamente.'
         )
      })

      it('should allow POST after rate limit duration passes', async () => {
         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         vi.setSystemTime(new Date('2026-02-07T11:00:00.000'))

         await apiPost({ action: 'rateLimitTest2', data: 'test1' })

         // Advance time beyond limit (1100ms > 1000ms)
         vi.setSystemTime(new Date('2026-02-07T11:00:01.100'))

         const result = await apiPost({ action: 'rateLimitTest2', data: 'test2' })

         expect(result).toEqual({ success: true })
         expect(fetch).toHaveBeenCalledTimes(2)
      })

      it('should apply rate limiting per action independently', async () => {
         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         vi.setSystemTime(new Date('2026-02-07T12:00:00'))

         await apiPost({ action: 'createUnique', data: 'test1' })

         // A different action should work even within the time limit
         const result = await apiPost({ action: 'updateUnique', data: 'test2' })

         expect(result).toEqual({ success: true })
         expect(fetch).toHaveBeenCalledTimes(2)
      })

      it('should use default action "POST" when body has no action field', async () => {
         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         vi.setSystemTime(new Date('2026-02-07T13:00:00.000'))

         await apiPost({ data: 'test' })

         vi.setSystemTime(new Date('2026-02-07T13:00:00.500'))

         await expect(apiPost({ data: 'test2' })).rejects.toThrow(
            'Aguarde um instante antes de enviar novamente.'
         )
      })

      it('should throw error when POST response is not ok', async () => {
         const mockResponse = {
            ok: false,
            text: vi.fn().mockResolvedValue('Dados inválidos')
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         vi.setSystemTime(new Date('2026-02-07T14:00:00'))

         await expect(apiPost({ action: 'errorTest' })).rejects.toThrow(
            'Dados inválidos'
         )
      })
   })

   describe('CSRF Token handling', () => {
      it('should include CSRF token in header when available', async () => {
         const mockMeta = { content: 'test-csrf-token' }
         globalThis.document = {
            querySelector: vi.fn().mockReturnValue(mockMeta)
         } as any

         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ data: 'test' })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         await apiGet({ action: 'list' })

         const call = vi.mocked(fetch).mock.calls[0]
         const headers = call[1]?.headers as Headers
         expect(headers.get('X-CSRF-Token')).toBe('test-csrf-token')
      })

      it('should try multiple selectors for CSRF token', async () => {
         const querySelectorMock = vi
            .fn()
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({ content: 'token-from-second' })

         globalThis.document = {
            querySelector: querySelectorMock
         } as any

         const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ data: 'test' })
         }
         vi.mocked(fetch).mockResolvedValue(mockResponse as any)

         await apiGet({ action: 'list' })

         expect(querySelectorMock).toHaveBeenCalledWith('meta[name="csrf-token"]')
         expect(querySelectorMock).toHaveBeenCalledWith('meta[name="csrf_token"]')

         const call = vi.mocked(fetch).mock.calls[0]
         const headers = call[1]?.headers as Headers
         expect(headers.get('X-CSRF-Token')).toBe('token-from-second')
      })
   })

   describe('Network Errors handling', () => {
      it('should handle specific NetworkError message', async () => {
         vi.mocked(fetch).mockRejectedValue(new Error('NetworkError when attempting'))

         await expect(apiGet({ action: 'list' })).rejects.toThrow(
            'Sem conexão. Verifique sua internet e tente novamente.'
         )
      })

      it('should propagate unknown error messages', async () => {
         const customError = new Error('Custom error message')
         vi.mocked(fetch).mockRejectedValue(customError)

         await expect(apiGet({ action: 'list' })).rejects.toThrow(
            'Custom error message'
         )
      })
   })
})