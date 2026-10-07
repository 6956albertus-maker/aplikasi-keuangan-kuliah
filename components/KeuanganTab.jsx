import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils';

export default function KeuanganTab({
  transactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
}) {
  // State Modal Edit
  const [editingTx, setEditingTx] = useState(null);

  // State Toggle Panel Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State Navigasi Bulan & Tahun Kalender
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Tanggal sementara di kalender (Sebelum Dikonfirmasi)
  const [rangeStart, setRangeStart] = useState(null); // YYYY-MM-DD
  const [rangeEnd, setRangeEnd] = useState(null);   // YYYY-MM-DD

  // Tanggal yang sudah Dikonfirmasi
  const [appliedStart, setAppliedStart] = useState(null);
  const [appliedEnd, setAppliedEnd] = useState(null);

  // Data Kalender
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const formatDateString = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Click handler untuk Kalender
  const handleDateClick = (day) => {
    const selectedDateStr = formatDateString(currentYear, currentMonth, day);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(selectedDateStr);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      if (new Date(selectedDateStr) < new Date(rangeStart)) {
        setRangeEnd(rangeStart);
        setRangeStart(selectedDateStr);
      } else {
        setRangeEnd(selectedDateStr);
      }
    }
  };

  // Logika Filter & Sorting
  const displayedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(a.tanggal || 0);
      const dateB = new Date(b.tanggal || 0);
      return dateB - dateA;
    });

    if (appliedStart || appliedEnd) {
      return sorted.filter((tx) => {
        if (!tx.tanggal) return false;
        const txDate = tx.tanggal;
        const start = appliedStart || '1970-01-01';
        const end = appliedEnd || appliedStart || '2099-12-31';

        return txDate >= start && txDate <= end;
      });
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const lastWeekTxs = sorted.filter((tx) => {
      if (!tx.tanggal) return false;
      return new Date(tx.tanggal) >= sevenDaysAgo;
    });

    const defaultData = lastWeekTxs.length > 0 ? lastWeekTxs : sorted;
    return defaultData.slice(0, 10);
  }, [transactions, appliedStart, appliedEnd]);

  // Handler Filter Action
  const handleApplyFilter = () => {
    setAppliedStart(rangeStart);
    setAppliedEnd(rangeEnd || rangeStart);
  };

  const handleResetFilter = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setAppliedStart(null);
    setAppliedEnd(null);
    setIsFilterOpen(false);
  };

  const handleUpdateTransaction = (e) => {
    e.preventDefault();
    if (editingTx && editTransaction) {
      editTransaction(editingTx);
      setEditingTx(null);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* RIWAYAT TRANSAKSI KEUANGAN */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* HEADER & TOGGLE FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Riwayat Transaksi Keuangan
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {appliedStart
                ? `Rentang: ${appliedStart} s/d ${appliedEnd}`
                : 'Menampilkan 10 transaksi / 1 minggu terakhir'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
              isFilterOpen || appliedStart
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Transaksi</span>
            {appliedStart && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* PANEL KALENDER RENTANG TANGGAL */}
        {isFilterOpen && (
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 max-w-sm">
            {/* Header Kalender */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Nama Hari */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Grid Tanggal */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = formatDateString(currentYear, currentMonth, day);

                const isStart = rangeStart === dateStr;
                const isEnd = rangeEnd === dateStr;
                const isInRange =
                  rangeStart &&
                  rangeEnd &&
                  dateStr > rangeStart &&
                  dateStr < rangeEnd;

                let btnStyle = 'bg-slate-900 text-slate-300 hover:bg-slate-700';

                if (isStart || isEnd) {
                  btnStyle = 'bg-purple-600 text-white font-bold ring-2 ring-purple-400';
                } else if (isInRange) {
                  btnStyle = 'bg-purple-900/50 text-purple-200 border border-purple-500/30';
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`py-2 text-xs rounded-lg transition-all flex items-center justify-center ${btnStyle}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Status Rentang */}
            <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-xl flex justify-around">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Awal:</span>
                <span className="font-semibold text-purple-300">{rangeStart || '-'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Akhir:</span>
                <span className="font-semibold text-purple-300">{rangeEnd || rangeStart || '-'}</span>
              </div>
            </div>

            {/* Tombol Aksion Filter */}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset / Batal
              </button>

              <button
                type="button"
                onClick={handleApplyFilter}
                disabled={!rangeStart}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg ${
                  rangeStart
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
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

                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                      title="Edit Transaksi"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

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

      {/* MODAL POPUP EDIT TRANSAKSI */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setEditingTx(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-sm text-purple-400 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span>Edit Transaksi</span>
            </h3>

            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              {/* Tipe Transaksi */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTx({ ...editingTx, tipe: 'pemasukan' })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    editingTx.tipe === 'pemasukan'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTx({ ...editingTx, tipe: 'pengeluaran' })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    editingTx.tipe === 'pengeluaran'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              {/* Keterangan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Keterangan</label>
                <input
                  type="text"
                  value={editingTx.keterangan || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Jumlah Uang dengan Logo Yuan di Akhir */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Jumlah Uang (Yuan)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="any"
                    value={editingTx.nominal_yuan || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, nominal_yuan: e.target.value })}
                    className="w-full p-3 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <span className="absolute right-3 text-sm font-bold text-slate-400 select-none">
                    ¥
                  </span>
                </div>
              </div>

              {/* Tanggal */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Tanggal</label>
                <input
                  type="date"
                  value={editingTx.tanggal || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, tanggal: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Metode Pilihan Tombol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Metode / Akun</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTx({ ...editingTx, metode: 'Cash' })}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      editingTx.metode === 'Cash' || editingTx.metode === 'Tunai'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    Tunai (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTx({ ...editingTx, metode: 'Bank' })}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      editingTx.metode === 'Bank'
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Bank
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-500 transition shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
