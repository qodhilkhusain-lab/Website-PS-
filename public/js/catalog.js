const packageList = document.querySelector('#packageList');
const packageSearch = document.querySelector('#packageSearch');
const priceFilter = document.querySelector('#priceFilter');
const emptyState = document.querySelector('#emptyState');
let packages = [];

function renderPackages(items) {
  packageList.innerHTML = '';

  if (items.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  items.forEach((item) => {
    const games = item.games.map((game) => `<span>${game}</span>`).join('');
    packageList.insertAdjacentHTML('beforeend', `
      <article class="package-card">
        <div class="package-image" style="background-image: url('${item.image}')"></div>
        <div class="package-body">
          <span class="badge">${item.tag}</span>
          <h3>${item.name}</h3>
          <p>${item.console} • ${item.capacity} • Stok ${item.stock}</p>
          <div class="game-list">${games}</div>
          <div class="package-meta">
            <span>${formatRupiah(item.pricePerHour)}/jam</span>
          </div>
          <a class="btn primary full" href="/booking.html?package=${item.id}">Booking</a>
        </div>
      </article>
    `);
  });
}

function applyFilter() {
  const keyword = packageSearch.value.toLowerCase().trim();
  const maxPrice = priceFilter.value;

  const filtered = packages.filter((item) => {
    const haystack = `${item.name} ${item.console} ${item.games.join(' ')}`.toLowerCase();
    const matchKeyword = haystack.includes(keyword);
    const matchPrice = maxPrice === 'all' || item.pricePerHour <= Number(maxPrice);
    return matchKeyword && matchPrice;
  });

  renderPackages(filtered);
}

async function initCatalog() {
  try {
    packages = await fetchJson('/api/packages');
    renderPackages(packages);
  } catch (error) {
    packageList.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

packageSearch.addEventListener('input', applyFilter);
priceFilter.addEventListener('change', applyFilter);
initCatalog();
