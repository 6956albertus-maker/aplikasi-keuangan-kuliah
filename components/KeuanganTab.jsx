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
  Calendar as CalendarIcon,
} from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils';

export default function KeuanganTab({
  transactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
}) {
  // Toggle Panel Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State Kalender (Bulan & Tahun yang sedang dilihat)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Tanggal yang dipilih sementara di kalender (Sebelum Dikonfirmasi)
  const [rangeStart, setRangeStart] = useState(null); // String YYYY-MM-DD
  const [rangeEnd, setRangeEnd] = useState(null);   // String YYYY-MM-DD

  // Tanggal yang sudah Dikonfirmasi
  const [appliedStart, setAppliedStart] = useState(null);
  const [appliedEnd, setAppliedEnd] = useState(null);

  // Logika Hari & Tanggal untuk Rendering Kalender
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Helper untuk format YYYY-MM-DD
  const formatDateString = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Handler saat Tanggal pada Kalender Diklik
  const handleDateClick = (day) => {
    const selectedDateStr = formatDateString(currentYear, currentMonth, day);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Pilih Tanggal Pertama
      setRangeStart(selectedDateStr);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      // Pilih Tanggal Kedua
      if (new Date(selectedDateStr) < new Date(rangeStart)) {
        setRangeEnd(rangeStart);
        setRangeStart(selectedDateStr);
      } else {
        setRangeEnd(selectedDateStr);
      }
    }
  };

  // Logika Filter & Limit Transaksi
  const displayedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(a.tanggal || 0);
      const dateB = new Date(b.tanggal || 0);
      return dateB - dateA;
    });

    // Jika Filter Rentang Tanggal Aktif
    if (appliedStart || appliedEnd) {
      return sorted.filter((tx) => {
        if (!tx.tanggal) return false;
        const txDate = tx.tanggal; // Format YYYY-MM-DD
        const start = appliedStart || '1970-01-01';
        const end = appliedEnd || appliedStart || '2099-12-31';

        return txDate >= start && txDate <= end;
      });
    }

    // Default: 10 Transaksi / 1 Minggu Terakhir
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

  // Aksi Konfirmasi
  const handleApplyFilter = () => {
    setAppliedStart(rangeStart);
    setAppliedEnd(rangeEnd || rangeStart);
  };

  // Aksi Reset
  const handleResetFilter = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setAppliedStart(null);
    setAppliedEnd(null);
    setIsFilterOpen(false);
  };

  // Navigasi Bulan Kalender
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
        
        {/* HEADER & TOMBOL TOGGLE FILTER */}
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
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 max-w-sm mx-auto sm:mx-0">
            
            {/* Navigasi Bulan & Tahun */}
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

            {/* Grid Hari dalam Seminggu */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Grid Tanggal Kalender */}
            <div className="grid grid-cols-7 gap-1">
              {/* Space Kosong Sebelum Hari Pertama */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Tanggal Bulan Ini */}
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

            {/* Keterangan Tanggal Terpilih */}
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

            {/* Tombol Konfirmasi & Reset */}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
