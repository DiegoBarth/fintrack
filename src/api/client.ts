const BASE_URL = import.meta.env.VITE_API_URL;

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

   const res = await fetch(`${BASE_URL}?${query}`);
   return handleResponse<T>(res);
}

export async function apiPost<T>(
   body: Record<string, any>
): Promise<T> {
   const res = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(body)
   });

   return handleResponse<T>(res);
}