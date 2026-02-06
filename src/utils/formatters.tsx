export function currencyToNumber(value: string): number {
   if (!value) return 0;

   return Number(
      value
         .replace(/\s/g, '')
         .replace('R$', '')
         .replace(/\./g, '')
         .replace(',', '.')
   );
}

export function numberToCurrency(value: number): string {
   return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
   });
}

export function dateBRToISO(date: string) {
   if (!date) return '';

   const [day, month, year] = date.split('/');
   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function formatCurrency(value: string) {
   const onlyNumbers = value.replace(/\D/g, '');

   const number = Number(onlyNumbers) / 100;

   return numberToCurrency(number);
}