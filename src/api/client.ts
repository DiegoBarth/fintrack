import { API_URL, API_TIMEOUT_MS } from '@/config/constants';

async function fetchWithTimeout(
   url: string,
   options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
   const { timeoutMs = API_TIMEOUT_MS, ...fetchOptions } = options;
   const controller = new AbortController();
   const id = setTimeout(() => controller.abort(), timeoutMs);

   try {
      const res = await fetch(url, {
         ...fetchOptions,
         signal: controller.signal
      });
      clearTimeout(id);
      return res;
   } catch (err) {
      clearTimeout(id);
      if (err instanceof Error) {
         if (err.name === 'AbortError') {
            throw new Error('A requisição demorou demais. Tente novamente.');
         }
         if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            throw new Error('Sem conexão. Verifique sua internet e tente novamente.');
         }
      }
      throw err;
   }
}

async function handleResponse<T>(res: Response): Promise<T> {
   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro na API');
   }
   return res.json();
}

export async function apiGet<T>(
   params: Record<string, string | number>
): Promise<T> {
   const query = new URLSearchParams(
      params as Record<string, string>
   ).toString();

   try {
      const res = await fetchWithTimeout(`${API_URL}?${query}`);
      return handleResponse<T>(res);
   } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Erro ao conectar com o servidor.');
   }
}

export async function apiPost<T>(
   body: Record<string, unknown>
): Promise<T> {
   try {
      const res = await fetchWithTimeout(API_URL, {
         method: 'POST',
         body: JSON.stringify(body)
      });
      return handleResponse<T>(res);
   } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Erro ao conectar com o servidor.');
   }
}