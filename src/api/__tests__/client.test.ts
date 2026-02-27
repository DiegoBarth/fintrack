import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiGet, apiPost } from '@/api/client';
import * as clientModule from '@/api/client';
import { act } from '@testing-library/react';
import { API_TIMEOUT_MS } from '@/config/constants';

globalThis.fetch = vi.fn() as any

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
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      const params = { action: 'list', month: '1', year: '2026' }
      const result = await apiGet(params)

      expect(globalThis.fetch).toHaveBeenCalledWith(
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
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      await expect(apiGet({ action: 'list' })).rejects.toThrow('Erro do servidor')
    })

    it('should throw error when response text is empty', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('')
      }
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      await expect(apiGet({ action: 'list' })).rejects.toThrow('Erro na API')
    })
  })

  describe('apiPost', () => {
    it('should perform POST request with correct body', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true })
      }
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      const result = await apiPost({ action: 'create', description: 'Test' })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'create', description: 'Test' })
        })
      )
      expect(result).toEqual({ success: true })
    })

    it('should use default action "POST"', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true })
      }
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      await apiPost({ description: 'Test' })
    })

    it('apiPost: should throw generic error for non-Error rejection', async () => {
      clientModule.lastPostByAction.clear()
        ; (globalThis.fetch as any).mockRejectedValue('string error' as any)

      await expect(apiPost({ action: 'new-action' })).rejects.toThrow(
        'Erro ao conectar com o servidor.'
      )
    })

  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-02-27T16:00:00.000'))
    })

    it('should enforce rate limit per action', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true })
      }
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      await apiPost({ action: 'test', data: 1 })

      const enforceSpy = vi.spyOn(clientModule, 'enforcePostRateLimit')
        .mockImplementationOnce(() => {
          throw new Error('Aguarde um instante antes de enviar novamente.')
        })

      await expect(apiPost({ action: 'test', data: 2 })).rejects.toThrow(
        'Aguarde um instante antes de enviar novamente.'
      )

      enforceSpy.mockRestore()
    })

    it('should allow different actions', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true })
      }
        ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

      // Limpa limite de ações
      clientModule.lastPostByAction.clear()

      await apiPost({ action: 'create', data: 1 })
      await apiPost({ action: 'update', data: 2 })

      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    })

    describe('CSRF Token', () => {
      it('should include CSRF token from first selector', async () => {
        const mockMeta = { content: 'test-csrf-token' }
          ; (globalThis as any).document = {
            querySelector: vi.fn().mockReturnValue(mockMeta)
          }

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({})
        }
          ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

        await apiGet({ action: 'list' })

        const call = (globalThis.fetch as any).mock.calls[0]
        const headers = call[1].headers as Headers
        expect(headers.get('X-CSRF-Token')).toBe('test-csrf-token')
      })

      it('should try all 3 CSRF selectors', async () => {
        const querySelector = vi.fn()
          .mockReturnValueOnce(null) // meta[name="csrf-token"]
          .mockReturnValueOnce(null) // meta[name="csrf_token"]
          .mockReturnValueOnce({ content: 'found-token' }) // meta[name="csrfToken"]

          ; (globalThis as any).document = { querySelector }

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({})
        }
          ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

        await apiGet({ action: 'list' })

        expect(querySelector).toHaveBeenNthCalledWith(1, 'meta[name="csrf-token"]')
        expect(querySelector).toHaveBeenNthCalledWith(2, 'meta[name="csrf_token"]')
        expect(querySelector).toHaveBeenNthCalledWith(3, 'meta[name="csrfToken"]')
      })

      it('should work server-side (no document)', async () => {
        const originalDoc = globalThis.document
          ; (globalThis as any).document = undefined

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ data: 'test' })
        }
          ; (globalThis.fetch as any).mockResolvedValue(mockResponse)

        const result = await apiGet({ action: 'list' })
        expect(result).toEqual({ data: 'test' })

        globalThis.document = originalDoc
      })
    })

    describe('Error Handling', () => {
      it('should handle AbortError (timeout)', async () => {
        const abortError = new Error('timeout')
        abortError.name = 'AbortError'
          ; (globalThis.fetch as any).mockRejectedValue(abortError)

        await expect(apiGet({ action: 'list' })).rejects.toThrow(
          'A requisição demorou demais. Tente novamente.'
        )
      })

      it('should handle network errors (Failed to fetch)', async () => {
        ; (globalThis.fetch as any).mockRejectedValue(new Error('Failed to fetch'))

        await expect(apiGet({ action: 'list' })).rejects.toThrow(
          'Sem conexão. Verifique sua internet e tente novamente.'
        )
      })

      it('should handle NetworkError', async () => {
        ; (globalThis.fetch as any).mockRejectedValue(new Error('NetworkError when attempting'))

        await expect(apiGet({ action: 'list' })).rejects.toThrow(
          'Sem conexão. Verifique sua internet e tente novamente.'
        )
      })

      it('should handle non-Error rejection', async () => {
        ; (globalThis.fetch as any).mockRejectedValue('string error' as any)

        await expect(apiGet({ action: 'list' })).rejects.toThrow(
          'Erro ao conectar com o servidor.'
        )
      })

    })
  })

  describe('Error Handling - Network coverage', () => {
    it('should handle "Failed to fetch" error', async () => {
      // Simula o erro exato que o Chrome/Vite costuma disparar
      const networkError = new Error('Failed to fetch');
      (globalThis.fetch as any).mockRejectedValue(networkError);

      await expect(apiGet({ action: 'list' })).rejects.toThrow(
        'Sem conexão. Verifique sua internet e tente novamente.'
      );
    });

    it('should handle "NetworkError" error', async () => {
      // Simula o erro exato que o Firefox/Safari costuma disparar
      const networkError = new Error('NetworkError when attempting to fetch resource.');
      (globalThis.fetch as any).mockRejectedValue(networkError);

      await expect(apiGet({ action: 'list' })).rejects.toThrow(
        'Sem conexão. Verifique sua internet e tente novamente.'
      );
    });

    it('should rethrow unknown Errors that do not match specific conditions', async () => {
      // Este teste é vital para cobrir o "throw err" no final do bloco catch do fetchWithTimeout
      const unknownError = new Error('Some random database error');
      (globalThis.fetch as any).mockRejectedValue(unknownError);

      await expect(apiGet({ action: 'list' })).rejects.toThrow('Some random database error');
    });
  });
})