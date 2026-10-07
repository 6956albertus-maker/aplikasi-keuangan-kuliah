import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  Banknote,
  Calendar,
  FileText,
  Tag,
  X,
  Filter,
  RotateCcw,
  Check,
} from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils';

export default function KeuanganTab({
  transactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
}) {
  // State untuk Toggle Panel Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State Input Tanggal sementara (sebelum dikonfirmasi)
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // State Tanggal yang sudah Dikonfirmasi
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  // Logika Penyaringan & Pembatasan Tampilan Transaksi
  const displayedTransactions = useMemo(() => {
    // 1. Urutkan transaksi dari yang terbaru
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(a.tanggal || 0);
      const dateB = new Date(b.tanggal || 0);
      return dateB - dateA;
    });

    // 2. Jika Filter Tanggal Diterapkan (setelah tombol Konfirmasi diklik)
    if (appliedStartDate || appliedEndDate) {
      return sorted.filter((tx) => {
        if (!tx.tanggal) return false;
        const txDate = new Date(tx.tanggal);
        const start = appliedStartDate ? new Date(appliedStartDate) : null;
        const end = appliedEndDate ? new Date(appliedEndDate) : null;

        if (start && txDate < start) return false;
        if (end && txDate > end) return false;
        return true;
      });
    }

    // 3. Default (Tanpa Filter Dikonfirmasi): 1 Minggu Terakhir atau Max 10 Transaksi Terakhir
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const lastWeekTxs = sorted.filter((tx) => {
      if (!tx.tanggal) return false;
      return new Date(tx.tanggal) >= sevenDaysAgo;
    });

    const defaultData = lastWeekTxs.length > 0 ? lastWeekTxs : sorted;
    return defaultData.slice(0, 10);
  }, [transactions, appliedStartDate, appliedEndDate]);

  // Handler Tombol Konfirmasi Filter
  const handleApplyFilter = () => {
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
  };

  // Handler Reset / Batal Filter
  const handleResetFilter = () => {
    setTempStartDate('');
    setTempEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ... (BAGIAN KARTU RINGKASAN & FORM TAMBAH TRANSAKSI TETAP SAMA) ... */}

      {/* RIWAYAT TRANSAKSI KEUANGAN */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        
        {/* HEADER & TOMBOL TOGGLE FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Riwayat Transaksi Keuangan
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {appliedStartDate || appliedEndDate
                ? 'Menampilkan transaksi berdasarkan rentang tanggal yang dipilih'
                : 'Menampilkan 10 transaksi / 1 minggu terakhir'}
            </p>
          </div>

          {/* Tombol Utama untuk Membuka Panel Filter */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
              isFilterOpen || appliedStartDate || appliedEndDate
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Transaksi</span>
            {(appliedStartDate || appliedEndDate) && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* PANEL INPUT RENTANG TANGGAL (HANYA MUNCUL SAAT TOMBOL FILTER DIKLIK) */}
        {isFilterOpen && (
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Input Tanggal Awal */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tanggal Awal
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <span className="hidden sm:inline text-xs text-slate-500 self-end mb-3">s/d</span>

              {/* Input Tanggal Akhir */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Tombol Aksion (Konfirmasi & Reset) */}
            <div className="flex justify-end items-center gap-2 pt-1 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset / Batal
              </button>

              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
              >
                <Check className="w-3.5 h-3.5" />
                Konfirmasi Filter
              </button>
            </div>
          </div>
        )}

        {/* DAFTAR TRANSAKSI */}
        <div className="space-y-3">
          {displayedTransactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium">
                Tidak ada transaksi pada rentang tanggal ini. 🚀
              </p>
            </div>
          ) : (
            displayedTransactions.map((tx) => {
              const isPemasukan = tx.tipe === 'pemasukan';
              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        isPemasukan
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isPemasukan ? (
                        <ArrowUpCircle className="w-5 h-5" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{tx.keterangan}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tx.tanggal || 'Hari ini'} •{' '}
                        <span className="text-purple-400">{tx.metode || 'Cash'}</span> •{' '}
                        <span className="text-pink-400">{tx.kategori || 'Umum'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`font-black text-xs ${
                          isPemasukan ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPemasukan ? '+' : '-'}
                        {formatYuan(tx.nominal_yuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(tx.nominal_yuan)}</p>
                    </div>

                    {/* Tombol Edit */}
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                      title="Edit Transaksi"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Tombol Hapus */}
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ... (MODAL POPUP EDIT TRANSAKSI TETAP SAMA) ... */}
    </div>
  );
}
