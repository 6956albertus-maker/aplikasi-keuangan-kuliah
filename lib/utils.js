// Konversi & Format Mata Uang
export const formatYuan = (amount) => {
  if (!amount && amount !== 0) return '¥0';
  return `¥${Number(amount).toLocaleString('id-ID')}`;
};

export const formatIDR = (yuanAmount, kurs = 2200) => {
  if (!yuanAmount && yuanAmount !== 0) return 'Rp 0';
  const idr = Number(yuanAmount) * kurs;
  return `Rp ${idr.toLocaleString('id-ID')}`;
};

// Tambahkan fungsi helper lain jika ada (misal: formatTanggal, kalkulasi GPA, dll.)
