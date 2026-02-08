type CacheMap<T> = Record<string, T[]>;

export function createListCache<T extends { rowIndex: number }>() {
   const cache: CacheMap<T> = {};

   function getKey(month: string | number, year: string | number) {
      const monthStr = String(month).padStart(2, '0');
      const yearStr = String(year);
      return `${yearStr}-${monthStr}`;
   }

   function get(month: string, year: number | string) {
      return cache[getKey(month, year)];
   }

   function set(month: string, year: number | string, data: T[]) {
      cache[getKey(month, year)] = data;
   }

   function add(item: T, DateField: keyof T) {
      const dataStr = item[DateField];
      if (!dataStr) return;

      const [_, month, year] = (dataStr as string).split('/').map(Number);

      const key = getKey(month, year);

      if (!cache[key]) cache[key] = [];
      cache[key].push(item);
   }

   function remove(month: string, year: number | string, rowIndex: number) {
      const key = getKey(month, year);
      if (!cache[key]) return;

      cache[key] = cache[key].filter(i => i.rowIndex !== rowIndex);
   }

   function update(month: string, year: number | string, payload: Partial<T> & { rowIndex: number }) {
      const key = getKey(month, year);
      if (!cache[key]) return;

      cache[key] = cache[key].map(i =>
         i.rowIndex === payload.rowIndex
            ? { ...i, ...payload }
            : i
      );
   }

   function clear(month?: string, year?: number | string) {
      if (!month || !year) {
         Object.keys(cache).forEach(k => delete cache[k]);
         return;
      }
      delete cache[getKey(month, year)];
   }

   return {
      getKey,
      get,
      set,
      add,
      update,
      remove,
      clear
   };
}