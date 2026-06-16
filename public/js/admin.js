const bookingTable = document.querySelector('#bookingTable');
const totalBookings = document.querySelector('#totalBookings');
const pendingBookings = document.querySelector('#pendingBookings');
const totalRevenue = document.querySelector('#totalRevenue');
const adminEmpty = document.querySelector('#adminEmpty');
const refreshBtn = document.querySelector('#refreshBtn');
const statusOptions = ['menunggu konfirmasi', 'dikonfirmasi', 'selesai', 'dibatalkan'];

function renderStats(bookings) {
  totalBookings.textContent = bookings.length;
  pendingBookings.textContent = bookings.filter((item) => item.status === 'menunggu konfirmasi').length;
  const revenue = bookings
    .filter((item) => item.status !== 'dibatalkan')
    .reduce((sum, item) => sum + item.total, 0);
  totalRevenue.textContent = formatRupiah(revenue);
}

function renderTable(bookings) {
  bookingTable.innerHTML = '';
  adminEmpty.classList.toggle('hidden', bookings.length > 0);

  bookings.forEach((item) => {
    const options = statusOptions.map((status) => `
      <option value="${status}" ${status === item.status ? 'selected' : ''}>${status}</option>
    `).join('');

    bookingTable.insertAdjacentHTML('beforeend', `
      <tr>
        <td>
          <strong>${item.name}</strong>
          <small>${item.phone}</small>
          <small>${item.serviceType === 'antar' ? item.address : 'Ambil di tempat'}</small>
        </td>
        <td>
          <strong>${item.packageName}</strong>
          <small>${item.notes}</small>
        </td>
        <td>
          ${formatDate(item.date)}
          <small>${item.startTime} • ${item.duration} jam</small>
        </td>
        <td><strong>${formatRupiah(item.total)}</strong></td>
        <td>
          <select class="status-select" data-id="${item.id}">
            ${options}
          </select>
        </td>
        <td>
          <button class="danger-link" data-delete="${item.id}">Hapus</button>
        </td>
      </tr>
    `);
  });
}

async function loadBookings() {
  try {
    const bookings = await fetchJson('/api/bookings');
    renderStats(bookings);
    renderTable(bookings);
  } catch (error) {
    bookingTable.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
  }
}

bookingTable.addEventListener('change', async (event) => {
  if (!event.target.matches('.status-select')) return;

  const id = event.target.dataset.id;
  const status = event.target.value;

  try {
    await fetchJson(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    loadBookings();
  } catch (error) {
    alert(error.message);
  }
});

bookingTable.addEventListener('click', async (event) => {
  const id = event.target.dataset.delete;
  if (!id) return;

  const confirmed = confirm('Yakin ingin menghapus booking ini?');
  if (!confirmed) return;

  try {
    await fetchJson(`/api/bookings/${id}`, { method: 'DELETE' });
    loadBookings();
  } catch (error) {
    alert(error.message);
  }
});

refreshBtn.addEventListener('click', loadBookings);
loadBookings();
