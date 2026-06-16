const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PACKAGES_FILE = path.join(DATA_DIR, 'packages.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function verifyAdminAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return false;
  const [username, password] = Buffer.from(auth.slice(6), 'base64').toString('utf-8').split(':');
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

function requireAdminAuth(req, res, next) {
  if (verifyAdminAuth(req)) return next();
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  res.status(401).send('Unauthorized');
}

app.get(['/admin', '/admin.html'], requireAdminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

async function readJson(file, fallback) {
  try {
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJson(file, fallback);
      return fallback;
    }
    throw error;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function isValidPhone(phone) {
  return /^08[0-9]{8,13}$/.test(phone);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBookingDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

function calculateTotal(packageItem, duration, serviceType) {
  const base = packageItem.pricePerHour * duration;
  const deliveryFee = serviceType === 'antar' ? 15000 : 0;
  return base + deliveryFee;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Ecromer Rental PS', timestamp: new Date().toISOString() });
});

app.get('/api/packages', async (req, res, next) => {
  try {
    const packages = await readJson(PACKAGES_FILE, []);
    res.json(packages);
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookings', requireAdminAuth, async (req, res, next) => {
  try {
    const bookings = await readJson(BOOKINGS_FILE, []);
    const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (error) {
    next(error);
  }
});

app.post('/api/bookings', async (req, res, next) => {
  try {
    const { name, phone, packageId, date, startTime, duration, serviceType, address, notes } = req.body;
    const durationNumber = toNumber(duration);
    const bookingDate = formatBookingDate(date);

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: 'Nama wajib diisi minimal 3 karakter.' });
    }

    if (!isValidPhone(phone || '')) {
      return res.status(400).json({ message: 'Nomor WhatsApp harus diawali 08 dan berisi 10-15 digit.' });
    }

    if (!packageId) {
      return res.status(400).json({ message: 'Pilih paket rental terlebih dahulu.' });
    }

    if (!bookingDate || !startTime) {
      return res.status(400).json({ message: 'Tanggal dan jam mulai wajib diisi.' });
    }

    if (durationNumber < 1 || durationNumber > 24) {
      return res.status(400).json({ message: 'Durasi rental harus 1 sampai 24 jam.' });
    }

    if (!['ambil', 'antar'].includes(serviceType)) {
      return res.status(400).json({ message: 'Jenis layanan tidak valid.' });
    }

    if (serviceType === 'antar' && (!address || address.trim().length < 8)) {
      return res.status(400).json({ message: 'Alamat wajib diisi untuk layanan antar.' });
    }

    const packages = await readJson(PACKAGES_FILE, []);
    const selectedPackage = packages.find((item) => item.id === packageId);

    if (!selectedPackage) {
      return res.status(404).json({ message: 'Paket rental tidak ditemukan.' });
    }

    const bookings = await readJson(BOOKINGS_FILE, []);
    const hasConflict = bookings.some((item) =>
      item.packageId === packageId &&
      item.date === bookingDate &&
      item.startTime === startTime &&
      item.status !== 'dibatalkan'
    );

    if (hasConflict) {
      return res.status(409).json({ message: 'Jadwal paket ini sudah terisi. Silakan pilih jam lain.' });
    }

    const newBooking = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone,
      packageId,
      packageName: selectedPackage.name,
      date: bookingDate,
      startTime,
      duration: durationNumber,
      serviceType,
      address: serviceType === 'antar' ? address.trim() : '-',
      notes: notes ? notes.trim() : '-',
      total: calculateTotal(selectedPackage, durationNumber, serviceType),
      status: 'menunggu konfirmasi',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    await writeJson(BOOKINGS_FILE, bookings);

    res.status(201).json({ message: 'Booking berhasil dibuat.', booking: newBooking });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/bookings/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatus = ['menunggu konfirmasi', 'dikonfirmasi', 'selesai', 'dibatalkan'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const bookings = await readJson(BOOKINGS_FILE, []);
    const target = bookings.find((item) => item.id === id);

    if (!target) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    target.status = status;
    target.updatedAt = new Date().toISOString();
    await writeJson(BOOKINGS_FILE, bookings);

    res.json({ message: 'Status booking berhasil diperbarui.', booking: target });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/bookings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await readJson(BOOKINGS_FILE, []);
    const filtered = bookings.filter((item) => item.id !== id);

    if (filtered.length === bookings.length) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    await writeJson(BOOKINGS_FILE, filtered);
    res.json({ message: 'Booking berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, () => {
  console.log(`Ecromer Rental PS berjalan di http://localhost:${PORT}`);
});
