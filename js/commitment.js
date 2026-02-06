document.addEventListener('DOMContentLoaded', () => {
   const form = document.getElementById('form-commitment');
   form.addEventListener('submit', saveCommitment);
});

function changeType() {
   const type = document.getElementById('type').value;

   standardBlock.style.display = 'none';
   cardBlock.style.display = 'none';

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
      action: 'createCommitment',
      type: type.value,
      description: description.value,
      category: category.value,
      amount: amount.value,
      dueDate: dueDateStandard.value
   });
}

async function saveCard() {
   await apiPost({
      action: 'createCard',
      description: description.value,
      category: category.value,
      card: card.value,
      totalAmount: totalAmount.value,
      installments: installments.value,
      dueDate: dueDateCard.value
   });
}

async function listCommitments() {
   const month = document.getElementById('filterMonth').value;
   const year = document.getElementById('filterYear').value;
   const list = document.getElementById('commitmentList');

   list.innerHTML = 'Carregando...';

   try {
      const data = await apiGet({
         action: 'listCommitments',
         month,
         year
      });

      list.innerHTML = '';

      if (!data.length) {
         list.innerHTML = '<li>Nenhum compromisso encontrado</li>';
         return;
      }

      data.forEach(c => {
         const li = document.createElement('li');
         const installment = c.installment ? ` (${c.installment}/${c.totalInstallments})` : '';

         li.innerText = `
${c.paid ? '✅' : '⏳'} ${c.description}${installment}
📂 ${c.category}
📅 Vencimento: ${c.dueDate}
💰 ${c.amount}
${c.card ? '💳 ' + c.card : ''}
         `.trim();

         list.appendChild(li);
      });

   } catch (err) {
      console.error(err);
      list.innerHTML = '<li>Erro ao carregar compromissos</li>';
   }
}