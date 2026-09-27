import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-supabase-js'; // Sesuaikan impor library Supabase Anda

// Inisialisasi Supabase Client (Ganti dengan URL & Key milik Anda jika dipisah)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function StudentManager() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('Keuangan');
  const [kursCnyToIdr, setKursCnyToIdr] = useState(2687); // Default kurs RMB ke IDR
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [tipe, setTipe] = useState('Pengeluaran'); // 'Pengeluaran' | 'Pemasukan'
  const [metodePembayaran, setMetodePembayaran] = useState('Cash'); // 'Cash' | 'Bank'
  const [kategori, setKategori] = useState('Makan');
  const [nominalYuan, setNominalYuan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

  // --- FETCH DATA TRANSAKSI ---
  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data:', error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- LOGIKA HITUNG SALDO CASH & BANK ---
  const calculateBalances = () => {
    let cashRmb = 0;
    let bankRmb = 0;

    transactions.forEach((tx) => {
      const nominal = parseFloat(tx.nominal_yuan) || 0;
      const isPemasukan = tx.tipe?.toLowerCase() === 'pemasukan';
      const amount = isPemasukan ? nominal : -nominal;

      const metode = tx.metode_pembayaran || 'Cash';
      if (metode.toLowerCase() === 'bank') {
        bankRmb += amount;
      } else {
        cashRmb += amount;
      }
    });

    return { cashRmb, bankRmb };
  };

  const { cashRmb, bankRmb } = calculateBalances();

  // --- SUBMIT TRANSAKSI BARU ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nominalYuan || parseFloat(nominalYuan) <= 0) {
      alert('Masukkan nominal yang valid');
      return;
    }

    const numYuan = parseFloat(nominalYuan);
    const numIdr = numYuan * kursCnyToIdr;

    const payload = {
      tipe,
      metode_pembayaran: metodePembayaran,
      kategori,
      nominal_yuan: numYuan,
      nominal_idr: numIdr,
      tanggal,
      keterangan,
    };

    const { error } = await supabase.from('transaksi').insert([payload]);

    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message);
    } else {
      // Reset form
      setNominalYuan('');
      setKeterangan('');
      fetchTransactions(); // Refresh data
    }
  };

  // --- HAPUS TRANSAKSI ---
  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
      const { error } = await supabase.from('transaksi').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else fetchTransactions();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Manager</h1>
            <p className="text-sm text-gray-500">Keuangan, Kuliah & Pembayaran</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs text-gray-600 font-medium">
              1 RMB = Rp {kursCnyToIdr.toLocaleString('id-ID')}
            </span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition">
              Mode Fullscreen
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['Utama', 'To Do Tugas', 'Keuangan', 'Kuliah', 'Pembayaran'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Keuangan' && (
          <>
            {/* KARTU SISA SALDO CASH & BANK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Saldo Cash */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sisa Saldo Cash</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    ¥ {cashRmb.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ Rp {(cashRmb * kursCnyToIdr).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                  💵
                </div>
              </div>

              {/* Saldo Bank */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sisa Saldo Bank</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    ¥ {bankRmb.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ Rp {(bankRmb * kursCnyToIdr).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                  💳
                </div>
              </div>
            </div>

            {/* FORM CATAT TRANSAKSI */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Catat Transaksi</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipe Transaksi: Pengeluaran / Pemasukan */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTipe('Pengeluaran')}
                    className={`py-2 rounded-lg text-sm font-semibold transition ${
                      tipe === 'Pengeluaran'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipe('Pemasukan')}
                    className={`py-2 rounded-lg text-sm font-semibold transition ${
                      tipe === 'Pemasukan'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>

                {/* Metode Pembayaran: Cash / Bank */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMetodePembayaran('Cash')}
                    className={`py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      metodePembayaran === 'Cash'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodePembayaran('Bank')}
                    className={`py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      metodePembayaran === 'Bank'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    💳 Bank
                  </button>
                </div>

                {/* Kategori */}
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Makan">Makan</option>
                  <option value="Jajan">Jajan</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Belanja">Belanja</option>
                  <option value="Kuliah">Kuliah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                {/* Nominal */}
                <input
                  type="number"
                  step="0.01"
                  placeholder="Nominal (¥ Yuan)"
                  value={nominalYuan}
                  onChange={(e) => setNominalYuan(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                {/* Tanggal */}
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                {/* Keterangan */}
                <input
                  type="text"
                  placeholder="Keterangan..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition shadow-sm shadow-blue-200"
                >
                  Simpan Transaksi
                </button>
              </form>
            </div>

            {/* RIWAYAT MUTASI */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Mutasi</h3>
              
              {loading ? (
                <p className="text-center text-gray-400 text-sm py-4">Memuat data...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Belum ada transaksi.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => {
                    const isPemasukan = tx.tipe?.toLowerCase() === 'pemasukan';
                    return (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {tx.kategori || 'Transaksi'}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase font-semibold">
                              {tx.metode_pembayaran || 'Cash'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {tx.tanggal} • {tx.keterangan || '-'}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                isPemasukan ? 'text-emerald-600' : 'text-rose-500'
                              }`}
                            >
                              {isPemasukan ? '+ ' : '- '}¥{' '}
                              {Number(tx.nominal_yuan).toLocaleString('id-ID', {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              Rp {Number(tx.nominal_idr).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="text-gray-300 hover:text-rose-500 text-xs p-1"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
