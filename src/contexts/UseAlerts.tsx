import { commitmentsCache } from '../cache/CommitmentsCache';
import { useMemo, useState, useEffect } from 'react';

function resetTime(date: Date) {
   const copy = new Date(date);
   copy.setHours(0, 0, 0, 0);
   return copy;
}

export function useAlerts() {
   const [tick, setTick] = useState(0);

   useEffect(() => {
      const originalAdd = commitmentsCache.add;

      commitmentsCache.add = (...args) => {
         originalAdd(...args);
         setTick(t => t + 1);
      };

      return () => {
         commitmentsCache.add = originalAdd;
      };
   }, []);

   return useMemo(() => {
      const today = resetTime(new Date());

      const pendingCommitments = commitmentsCache
         .getAll()
         .filter(c => !c.paymentDate && !c.paid);

      const dueToday = pendingCommitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const dueDate = resetTime(new Date(y, m - 1, d));
         return dueDate.getTime() === today.getTime();
      });

      const dueThisWeek = pendingCommitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const dueDate = resetTime(new Date(y, m - 1, d));
         const diffDays = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

         return diffDays > 0 && diffDays <= 7;
      });

      return {
         today: dueToday,
         week: dueThisWeek
      };
   }, [tick]);
}