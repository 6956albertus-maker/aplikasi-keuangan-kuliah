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
} from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils';

export default function KeuanganTab({
  transactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
}) {
  // Filter Rentang Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtering & Sorting Logika
  const displayedTransactions = useMemo(() => {
    // 1. Urutkan transaksi dari yang terbaru berdasarkan tanggal/id
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(a.tanggal || 0);
      const dateB = new Date(b.tanggal || 0);
      return dateB - dateA;
    });

    // 2. Jika user memasukkan Filter Rentang Tanggal
    if (startDate || endDate) {
      return sorted.filter((tx) => {
        if (!tx.tanggal) return false;
        const txDate = new Date(tx.tanggal);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && txDate < start) return false;
        if (end && txDate > end) return false;
        return true;
      });
    }

    // 3. Default (Jika filter kosong): Hanya tampilkan max 10 transaksi terakhir atau 7 hari terakhir
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const lastWeekTxs = sorted.filter((tx) => {
      if (!tx.tanggal) return false;
      return new Date(tx.tanggal) >= sevenDaysAgo;
    });

    // Ambil mana yang lebih fleksibel: hasil 1 minggu terakhir, lalu batasi maksimal 10 data
    const defaultData = lastWeekTxs.length > 0 ? lastWeekTxs : sorted;
    return defaultData.slice(0, 10);
  }, [transactions, startDate, endDate]);

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* ... (BAGIAN KARTU RINGKASAN & FORM TAMBAH TRANSAKSI TETAP SAMA) ... */}

      {/* RIWAYAT TRANSAKSI KEUANGAN */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        
        {/* HEADER & FILTER RENTANG TANGGAL PERMANEN */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Riwayat Transaksi Keuangan
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {!startDate && !endDate
                ? 'Menampilkan 10 transaksi / 1 minggu terakhir'
                : 'Menampilkan transaksi berdasarkan rentang tanggal'}
            </p>
          </div>

          {/* Filter Rentang Tanggal (Permanen) */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 px-2">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-slate-300">Filter:</span>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Awal"
            />
            <span className="text-xs text-slate-500">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Akhir"
            />

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="p-1.5 px-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                title="Reset Filter"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

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
