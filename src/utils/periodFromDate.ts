/**
 * When the user picks a date in a calendar (add modals), align only the form field
 * "Mês de Referência" (YYYY-MM). Does not change PeriodContext / home filter.
 */
export function syncReferenceMonthFromDate(
  date: Date | undefined,
  setReferenceMonth: (ref: string) => void
): void {
  if (!date || Number.isNaN(date.getTime())) return
  const m = date.getMonth() + 1
  const y = date.getFullYear()
  setReferenceMonth(`${y}-${String(m).padStart(2, '0')}`)
}
