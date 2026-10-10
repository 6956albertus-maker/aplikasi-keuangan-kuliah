/**
 * Utility functions untuk Aplikasi Student Manager
 */

// 1. FORMAT CURRENCY (YUAN & RUPIAH)

/**
 * Format nominal angka ke string format Yuan (misal: ¥1.250,50)
 * @param {number|string} nominal 
 * @returns {string}
 */
export const formatYuan = (nominal) => {
  const num = Number(nominal) || 0;
  return `¥${num.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format nominal Yuan ke Rupiah berdasarkan kurs dinamis Supabase
 * @param {number|string} nominalYuan 
 * @param {number} kurs 
 * @returns {string}
 */
export const formatIDR = (nominalYuan, kurs = 2671) => {
  const totalRupiah = (Number(nominalYuan) || 0) * Number(kurs);
  return `Rp ${totalRupiah.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format angka murni ke format Rupiah standar (misal: Rp 150.000)
 * @param {number|string} nominal 
 * @returns {string}
 */
export const formatRupiahDirect = (nominal) => {
  const num = Number(nominal) || 0;
  return `Rp ${num.toLocaleString('id-ID')}`;
};

// 2. HELPER PRIORITAS TUGAS (OTOMATIS)

/**
 * Menghitung tingkat prioritas secara otomatis berdasarkan sisa hari menuju tenggat
 * @param {string} tenggatStr - Format tanggal YYYY-MM-DD
 * @returns {'Tinggi' | 'Sedang' | 'Rendah'}
 */
export const getHitungPrioritas = (tenggatStr) => {
  if (!tenggatStr) return 'Rendah';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tenggatDate = new Date(tenggatStr);
  tenggatDate.setHours(0, 0, 0, 0);

  const diffTime = tenggatDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return 'Tinggi'; // Dibawah 1 hari (termasuk hari ini / sudah lewat)
  } else if (diffDays <= 3) {
    return 'Sedang'; // Dibawah / sama dengan 3 hari
  } else {
    return 'Rendah'; // Diatas 3 hari
  }
};

/**
 * Memeriksa apakah suatu tugas sudah berusia lebih dari 30 hari (1 bulan) sejak tenggat
 * @param {string} tenggatStr 
 * @returns {boolean}
 */
export const isMoreThanOneMonthOld = (tenggatStr) => {
  if (!tenggatStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tenggatDate = new Date(tenggatStr);
  tenggatDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - tenggatDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 30;
};

// 3. HELPER TANGGAL & KALENDER

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Format tanggal string YYYY-MM-DD ke format Indonesia (misal: 10 Oktober 2026)
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Mengembalikan tanggal hari ini dengan format YYYY-MM-DD
 * @returns {string}
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
