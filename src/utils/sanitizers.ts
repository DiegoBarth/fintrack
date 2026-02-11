/**
 * Sanitizes a string by removing extra spaces and non-printable control characters.
 * * @param value - The raw string to be cleaned.
 * @returns The sanitized and trimmed string.
 */
export function sanitizeText(value: string): string {
   return value
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\u0000-\u001F\u007F]/g, '');
}