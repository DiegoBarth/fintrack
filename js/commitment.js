document.addEventListener('DOMContentLoaded', () => {
   const form = document.getElementById('form-commitment');
   form.addEventListener('submit', saveCommitment);

   const today        = new Date();
   const currentMonth = today.getMonth() + 1;

   const monthFilter = document.getElementById('filtroMes');
   const YearFilter  = document.getElementById('filtroAno');

   monthFilter.value = currentMonth;
   YearFilter.value  = today.getFullYear();
});

function changeType() {
   const type = document.getElementById('type').value;

   standardBlock.style.display = 'none';
   cardBlock.style.display     = 'none';

   if (type === 'fixed' || type === 'variable') {
      standardBlock.style.display = 'block';
   }

   if (type === 'card') {
      cardBlock.style.display = 'block';
   }
}

function generateInstallments(total) {
   const select = document.getElementById('installments');
   select.innerHTML = '<option value="">Installments</option>';

   for (let i = 1; i <= total; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i}/${total}`;
      select.appendChild(option);
   }
}

async function saveCommitment(e) {
   e.preventDefault();

   const type = document.getElementById('type').value;

   if (type === 'card') {
      await saveCard();
   } else {
      await saveStandard();
   }

   msg.innerText = 'Compromisso salvo 📅';
   e.target.reset();
}

async function saveStandard() {
   await apiPost({
      action:      'createCommitment',
      type:        type.value,
      description: description.value,
      category:    category.value,
      amount:      amount.value,
      dueDate:     dueDateStandard.value
   });
}

async function saveCard() {
   await apiPost({
      action:       'createCard',
      description:  description.value,
      category:     category.value,
      card:         card.value,
      totalAmount:  totalAmount.value,
      installments: installments.value,
      dueDate:      dueDateCard.value
   });
}

async function listCommitments() {
   const month = document.getElementById('filterMonth').value;
   const year  = document.getElementById('filterYear').value;
   const list  = document.getElementById('commitmentList');
   const grid  = document.getElementById('commitmentsGrid');

   list.innerHTML = 'Carregando...';
   grid.innerHTML = '<tr><td colspan="8">Carregando...</td></tr>';

   const data = await apiGet({
      action: 'listCommitments',
      month,
      year
   });

   grid.innerHTML = '';

   data.forEach(c => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
      <td>${c.description}</td>
      <td>${c.category}</td>
      <td>${c.installment  ? `${c.installment }/${c.totalInstallments }` : '-'}</td>
      <td>
        <input type="text"
               value="${numberToCurrency(c.value)}"
               oninput="formatCurrency(this)">
      </td>
      <td>${c.dataVencimento}</td>
      <td>
        <input type="checkbox" ${c.paid ? 'checked' : ''} disabled>
      </td>
      <td>
        <button onclick="updateCommitment(this, ${c.rowIndex})">
            💾
        </button>
         <button onclick="deleteCommitment(this, ${c.rowIndex})">
            🗑
        </button>
      </td>
    `;

      grid.appendChild(tr);
   });
}

function dateToISO(BRDate) {
   if (!BRDate) return '';
   const [day, month, year] = BRDate.split('/');
   return `${year}-${month}-${day}`;
}

async function updateCommitment(button, rowIndex) {
   const tr = button.closest('tr');
   const inputs = tr.querySelectorAll('input');

   const value = inputs[0].value;
   const paymentDate = inputs[1].value;
   const paid = inputs[2].checked;

   await apiPost({
      action: 'updateCommitment',
      rowIndex,
      value,
      paymentDate,
      paid
   });


} async function deleteCommitment(button, rowIndex) {
   try {
      await apiPost({
         action: 'deleteCommitment',
         rowIndex
      });

      const tr = button.closest('tr');

      tr.remove();

      alert('Compromisso excluído ✔️');
   } catch (e) {
      console.log(e);
   }
}