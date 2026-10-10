// Konversi & Format Mata Uang
export const formatYuan = (amount) => {
  if (!amount && amount !== 0) return '¥0';
  return `¥${Number(amount).toLocaleString('id-ID')}`;
};

export const formatIDR = (nominalYuan, kurs = 2671) => {
  const totalRupiah = (Number(nominalYuan) || 0) * kurs;
  return `Rp ${totalRupiah.toLocaleString('id-ID')}`;
};
// Tambahkan fungsi helper lain jika ada (misal: formatTanggal, kalkulasi GPA, dll.)
