/**
 * FORMATTING UTILITIES
 * * A set of functions for converting between common formats:
 * - Currency: BRL String ↔ Number
 * - Date: BR Format (DD/MM/YYYY) ↔ ISO (YYYY-MM-DD)
 */

/**
 * Converts a currency string to a number
 * * Supports multiple formats:
 * - "R$ 1.234,56" → 1234.56
 * - "1.234,56" → 1234.56
 * - "1234,56" → 1234.56
 * * Processing:
 * 1. Removes whitespace
 * 2. Removes "R$"
 * 3. Removes dots (thousands separator)
 * 4. Replaces comma with dot (decimal)
 * 5. Converts to Number
 * * @param value - Currency string (e.g., "R$ 1.234,56")
 * @returns Floating point number (e.g., 1234.56)
 * * @example
 * currencyToNumber("R$ 100,50") // → 100.50
 * currencyToNumber("1.500,00") // → 1500.00
 */
export function currencyToNumber(value: string): number {
   if (!value) return 0;

   return Number(
      value
         .replace(/\s/g, '') // Removes spaces
         .replace('R$', '')  // Removes symbol
         .replace(/\./g, '') // Removes thousands separator
         .replace(',', '.')  // Converts comma to decimal point
   );
}

/**
 * Converts a number to a formatted BRL currency string
 * * Uses Intl.NumberFormat to handle:
 * - Thousands separator (.)
 * - Decimal separator (,)
 * - BRL symbol (R$)
 * - Exactly 2 decimal places
 * * @param value - Number to format (e.g., 1234.56)
 * @returns Formatted BRL string (e.g., "R$ 1.234,56")
 * * @example
 * numberToCurrency(1234.56) // → "R$ 1.234,56"
 * numberToCurrency(0)       // → "R$ 0,00"
 */
export function numberToCurrency(value: number | string): string {
   return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
   });
}

/**
 * Converts a Brazilian format date to ISO format
 * * Conversion:
 * - "25/12/2025" → "2025-12-25"
 * * Special cases:
 * - Empty input: returns an empty string
 * - Zero padding: "1/1/2025" → "2025-01-01"
 * * @param date - Date in BR format (DD/MM/YYYY)
 * @returns Date in ISO format (YYYY-MM-DD)
 * * @example
 * dateBRToISO("25/12/2025") // → "2025-12-25"
 * dateBRToISO("1/1/2025")   // → "2025-01-01"
 * dateBRToISO("")           // → ""
 */
export function dateBRToISO(date: string) {
   if (!date) return '';

   const [day, month, year] = date.split('/');
   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Formats a currency string as the user types
 * * Flow:
 * 1. Removes all non-numeric characters
 * 2. Divides by 100 (to handle cents)
 * 3. Formats using numberToCurrency
 * * Useful for real-time currency inputs:
 * "123" → "R$ 1,23"
 * "1234" → "R$ 12,34"
 * "123456" → "R$ 1.234,56"
 * * @param value - Value typed in the input (e.g., "123")
 * @returns Formatted currency string (e.g., "R$ 1,23")
 * * @example
 * formatCurrency("123") // → "R$ 1,23"
 * formatCurrency("1234567") // → "R$ 12.345,67"
 */
export function formatCurrency(value: string) {
   const onlyNumbers = value.replace(/\D/g, '');

   if (!onlyNumbers) return numberToCurrency(0);

   const number = Number(onlyNumbers) / 100;

   return numberToCurrency(number);
}

/**
 * Converts a Date object or ISO string to Brazilian format
 * * Supported inputs:
 * - Date object: new Date("2025-12-25")
 * - ISO String: "2025-12-25"
 * * Timezone handling:
 * - Appends 'T12:00:00' to avoid timezone-related issues
 * - Ensures the same date across any timezone
 * * @param date - Date object or ISO string (YYYY-MM-DD)
 * @returns Date in BR format (DD/MM/YYYY)
 * * @example
 * formatDateBR(new Date("2025-12-25")) // → "25/12/2025"
 * formatDateBR("2025-12-25")           // → "25/12/2025"
 * formatDateBR("2025-01-01")           // → "01/01/2025"
 */
export function formatDateBR(date: string | Date): string {
   // Appends T12:00:00 to avoid timezone interpretation issues
   // For example, "2025-12-25" could be interpreted as 23:00 on the previous day
   const d = new Date(date + 'T12:00:00');
   const day = String(d.getDate()).padStart(2, '0');
   const month = String(d.getMonth() + 1).padStart(2, '0');
   const year = d.getFullYear();

   return `${day}/${month}/${year}`;
}

/**
 * Extracts month and year from a Brazilian format date
 * * Useful for period filters without the day
 * * @param date - Date in BR format (DD/MM/YYYY)
 * @returns Object with month and year as strings
 * * @example
 * getMonthYear("25/12/2025") // → { month: "12", year: "2025" }
 * getMonthYear("01/01/2025") // → { month: "01", year: "2025" }
 */
export function getMonthAndYear(ISODataOrBR: string) {
   let date: Date

   if (ISODataOrBR.includes('/')) {
      const [day, month, year] = ISODataOrBR.split('/').map(Number)
      date = new Date(year, month - 1, day)
   } else {
      date = new Date(ISODataOrBR)
   }

   const month = String(date.getMonth() + 1)
   const year = String(date.getFullYear())

   return { month: String(Number(month)), year };
}

export function getMonthAndYearFromReference(referenceMonth: string) {
   const [year, month] = referenceMonth.split('-')
   return {
      month: String(Number(month)),
      year
   }
}

/**
 * Parses a date string in "yyyy-MM-dd" format into a local Date object.
 *
 * IMPORTANT:
 * Avoid using `new Date("yyyy-MM-dd")` because JavaScript interprets
 * that format as UTC, which can cause off-by-one-day issues depending
 * on the user's timezone.
 *
 * This function ensures the date is created in the local timezone,
 * preventing unintended date shifts.
 *
 * @param dateString - Date string in "yyyy-MM-dd" format
 * @returns A Date object in the local timezone
 */
export function parseLocalDate(dateString: string): Date {
   const [year, month, day] = dateString.split("-").map(Number)
   return new Date(year, month - 1, day)
}
