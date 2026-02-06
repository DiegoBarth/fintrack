function formatCurrency(input) {
   let value = input.value.replace(/\D/g, '');

   if (!value) {
      input.value = '';
      return;
   }

   value = (parseInt(value, 10) / 100).toFixed(2);
   value = value.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
   input.value = 'R$ ' + value;
}

function parseCurrency(value) {
   return Number(value.replace(/\./g, '').replace(',', '.').replace('R$', ''));
}

function formatDate(date) {
   const [day, month, year] = date.split('-');
   return `${day}/${month}/${year}`;
}