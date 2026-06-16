const form = document.querySelector('#bookingForm');
const packageSelect = document.querySelector('#packageId');
const durationInput = document.querySelector('#duration');
const serviceTypeInput = document.querySelector('#serviceType');
const addressRow = document.querySelector('#addressRow');
const addressInput = document.querySelector('#address');
const alertBox = document.querySelector('#bookingAlert');
const summaryPackage = document.querySelector('#summaryPackage');
const summaryPrice = document.querySelector('#summaryPrice');
const summaryDuration = document.querySelector('#summaryDuration');
const summaryDelivery = document.querySelector('#summaryDelivery');
const summaryTotal = document.querySelector('#summaryTotal');
let packages = [];

function getSelectedPackage() {
  return packages.find((item) => item.id === packageSelect.value);
}

function updateSummary() {
  const selected = getSelectedPackage();
  const duration = Math.max(1, Number(durationInput.value) || 1);
  const delivery = serviceTypeInput.value === 'antar' ? 15000 : 0;
  const price = selected ? selected.pricePerHour : 0;
  const total = price * duration + delivery;

  summaryPackage.textContent = selected ? selected.name : 'Belum memilih paket';
  summaryPrice.textContent = formatRupiah(price);
  summaryDuration.textContent = `${duration} jam`;
  summaryDelivery.textContent = formatRupiah(delivery);
  summaryTotal.textContent = formatRupiah(total);

  const isDelivery = serviceTypeInput.value === 'antar';
  addressRow.classList.toggle('hidden', !isDelivery);
  addressInput.required = isDelivery;
}

function showAlert(message, type = 'success') {
  alertBox.className = `alert ${type}`;
  alertBox.innerHTML = message;
}

async function initBooking() {
  try {
    packages = await fetchJson('/api/packages');
    packageSelect.innerHTML = '<option value="">Pilih paket</option>';
    packages.forEach((item) => {
      packageSelect.insertAdjacentHTML('beforeend', `<option value="${item.id}">${item.name} - ${formatRupiah(item.pricePerHour)}/jam</option>`);
    });

    const params = new URLSearchParams(window.location.search);
    const selectedPackage = params.get('package');
    if (selectedPackage) {
      packageSelect.value = selectedPackage;
    }

    const today = new Date().toISOString().split('T')[0];
    document.querySelector('#date').min = today;
    document.querySelector('#date').value = today;
    updateSummary();
  } catch (error) {
    packageSelect.innerHTML = '<option value="">Paket gagal dimuat</option>';
    showAlert(error.message, 'error');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await fetchJson('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    showAlert(`
      <strong>Booking berhasil!</strong><br>
      Kode booking: ${data.booking.id.slice(0, 8).toUpperCase()}<br>
      Paket: ${data.booking.packageName}<br>
      Total: ${formatRupiah(data.booking.total)}
    `);
    form.reset();
    document.querySelector('#date').value = new Date().toISOString().split('T')[0];
    durationInput.value = 2;
    updateSummary();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

packageSelect.addEventListener('change', updateSummary);
durationInput.addEventListener('input', updateSummary);
serviceTypeInput.addEventListener('change', updateSummary);
initBooking();
