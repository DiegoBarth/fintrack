const API_URL = 'https://script.google.com/macros/s/AKfycbztaKHZIjuxK2RGcV95gsa07GwzPyWGPqjMnoNWFGYBh_GCF-7aZFyH2_apwLZCdpAhQg/exec';

async function apiPost(payload) {
   const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
   });

   return res.json();
}

async function apiGet(params = {}) {
   const query = new URLSearchParams(params).toString();
   const res = await fetch(`${API_URL}?${query}`);

   return res.json();
}