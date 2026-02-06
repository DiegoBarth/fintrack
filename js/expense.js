document.addEventListener('DOMContentLoaded', () => {
   const form = document.getElementById('form-expense');
   const amountInput = document.getElementById('amount');
   const msg = document.getElementById('msg');
   const searchBtn = document.getElementById('btn-search');

   amountInput.addEventListener('input', () => formatCurrency(amountInput));
   form.addEventListener('submit', saveExpense);
   searchBtn.addEventListener('click', listExpenses);
});

async function saveExpense(e) {
   e.preventDefault();

   const date = document.getElementById('date').value;
   const description = document.getElementById('description').value;
   const category = document.getElementById('category').value;
   const formattedAmount = document.getElementById('amount').value;

   const amount = parseCurrency(formattedAmount);

   if (amount <= 0) {
      alert('Informe um valor válido');
      return;
   }

   const formattedDate = formatDate(date);

   const payload = {
      entryType: 'expense',
      date: formattedDate,
      description,
      category,
      amount
   };

   await apiPost({
      action: 'createExpense',
      ...payload
   });

   msg.innerText = 'Gasto salvo 💸';
   e.target.reset();
}

async function listExpenses() {
   const month = document.getElementById('month').value;
   const year = document.getElementById('year').value;
   const list = document.getElementById('list');

   const data = await apiGet({
      action: 'listExpenses',
      month,
      year
   });

   list.innerHTML = '';

   data.forEach(item => {
      const li = document.createElement('li');
      li.innerText = `${item[1]} - ${item[2]} - R$ ${item[3]}`;
      list.appendChild(li);
   });
}