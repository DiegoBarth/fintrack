function formatCurrency(input) {
   let value = input.value.replace(/\D/g, '');

   if (!value) {
      input.value = '';
      return;
   }

   const number = Number(value) / 100;

   input.value = number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
   });
}

function numberToCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '';

  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

function parseCurrency(value) {
   return Number(value.replace(/\./g, '').replace(',', '.').replace('R$', ''));
}

function formatDate(date) {
   const [day, month, year] = date.split('-');
   return `${day}/${month}/${year}`;
}