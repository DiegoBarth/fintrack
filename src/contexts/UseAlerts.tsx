import { commitmentsCache } from "@/cache/CommitmentsCache";
import { useMemo, useState, useEffect } from 'react';

/**
 * Resets the time to midnight for accurate date comparison.
 */
function resetTime(d: Date) {
   const copy = new Date(d);
   copy.setHours(0, 0, 0, 0);
   return copy;
}

export function useAlerts() {
   const [tick, setTick] = useState(0);

   useEffect(() => {
      // Monkey-patching the cache to trigger re-renders on changes
      const oldAdd = commitmentsCache.add;
      const oldUpdate = commitmentsCache.update;
      const oldRemove = commitmentsCache.remove;

      const bump = () => setTick(t => t + 1);

      commitmentsCache.add = (...args) => {
         oldAdd(...args);
         bump();
      };

      commitmentsCache.update = (...args) => {
         oldUpdate(...args);
         bump();
      };

      commitmentsCache.remove = (...args) => {
         oldRemove(...args);
         bump();
      };

      return () => {
         commitmentsCache.add = oldAdd;
         commitmentsCache.update = oldUpdate;
         commitmentsCache.remove = oldRemove;
      };
   }, []);

   return useMemo(() => {
      const today = resetTime(new Date());

      // Filter only unpaid commitments
      const commitments = commitmentsCache
         .getAll()
         .filter(c => !c.paymentDate);

      // 1. Overdue Commitments (Vencidos)
      const overdue = commitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const date = resetTime(new Date(y, m - 1, d));

         const diffDays = Math.ceil(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
         );

         return diffDays < 0;
      });

      // 2. Due Today (Vencendo Hoje)
      const dueToday = commitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const date = resetTime(new Date(y, m - 1, d));
         return date.getTime() === today.getTime();
      });

      // 3. Due this week (Vencendo na semana - next 7 days)
      const dueThisWeek = commitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const date = resetTime(new Date(y, m - 1, d));

         const diffDays = Math.ceil(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
         );

         return diffDays > 0 && diffDays <= 7;
      });

      return {
         overdue,
         today: dueToday,
         week: dueThisWeek
      };
   }, [tick]);
}