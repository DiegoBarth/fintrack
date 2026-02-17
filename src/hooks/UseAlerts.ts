import { useMemo } from 'react';
import { usePeriod } from '@/contexts/PeriodContext';
import { useCommitment } from './useCommitment';
import { WEEKLY_ALERT_DAYS, MS_PER_DAY } from '@/config/constants';

/**
 * Resets the time to midnight for accurate date comparison.
 */
function resetTime(d: Date) {
   const copy = new Date(d);
   copy.setHours(0, 0, 0, 0);
   return copy;
}

/**
 * Hook to manage financial alerts (overdue, due today, due this week).
 * It fetches all commitments for the year to ensure alerts are visible 
 * regardless of the currently selected month.
 */
export function useAlerts() {
   const { year } = usePeriod();
   const { alertCommitments } = useCommitment('all', String(year))

   return useMemo(() => {
      const today = resetTime(new Date());

      // Filter only unpaid commitments
      const pendingCommitments = alertCommitments.filter(c => !c.paymentDate);

      // 1. Overdue (Vencidos)
      const overdue = pendingCommitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const date = resetTime(new Date(y, m - 1, d));

         const diffDays = Math.ceil(
            (date.getTime() - today.getTime()) / MS_PER_DAY
         );

         return diffDays < 0;
      });

      // 2. Due Today (Vencendo Hoje)
      const dueToday = pendingCommitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const date = resetTime(new Date(y, m - 1, d));
         return date.getTime() === today.getTime();
      });

      // 3. Due this week (Vencendo na semana - next 7 days)
      const dueThisWeek = pendingCommitments.filter(c => {
         const [d, m, y] = c.dueDate.split('/').map(Number);
         const date = resetTime(new Date(y, m - 1, d));

         const diffDays = Math.ceil(
            (date.getTime() - today.getTime()) / MS_PER_DAY
         );

         return diffDays > 0 && diffDays <= WEEKLY_ALERT_DAYS;
      });

      return {
         overdue,
         today: dueToday,
         week: dueThisWeek
      };
   }, [alertCommitments]);
}