import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  Banknote,
  Calendar,
  FileText,
  Tag,
} from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils';

const EXPENSE_CATEGORIES = [
  'Makan',
  'Minum',
  'Transportasi',
  'Biaya Kuliah',
  'Belanja',
  'Laundry',
  'Lain-lain',
];

export default function KeuanganTab({ transactions, addTransaction, deleteTransaction }) {
  const [txType, setTxType] = useState('pemasukan');
  const [txAccount, setTxAccount] = useState('Cash');
  const [txCategory, setTxCategory] = useState('Makan');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txTitle, setTxTitle] = useState('');

  // Pengiraan Baki Keuangan
  const calculateTotals = () => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let totalTunai = 0;
    let totalBank = 0;

    transactions.forEach((tx) => {
      const amount = parseFloat(tx.nominal_yuan) || 0;
      const isPemasukan = tx.tipe === 'pemasukan';
      const isTunai = tx.metode === 'Cash' || tx.metode === 'Tunai';

      if (isPemasukan) {
        totalPemasukan += amount;
        if (isTunai) totalTunai += amount;
        else totalBank += amount;
      } else {
        totalPengeluaran += amount;
        if (isTunai) totalTunai -= amount;
        else totalBank -= amount;
      }
    });

    return { totalPemasukan, totalPengeluaran, totalTunai, totalBank };
  };

  const { totalPemasukan, totalPengeluaran, totalTunai, totalBank } = calculateTotals();

  // Simpan Transaksi Baharu
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!txTitle || !txAmount || !txDate) return;

    await addTransaction({
      keterangan: txTitle,
      nominal_yuan: parseFloat(txAmount),
      metode: txAccount,
      kategori: txType === 'pengeluaran' ? txCategory : 'Pemasukan',
      tipe: txType,
      tanggal: txDate,
    });

    setTxTitle('');
    setTxAmount('');
  };

  return (
    <div className="space-y-6">
      {/* 4 KAD RINGKASAN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-900/30 via-emerald-950/20 to-slate-900/60 backdrop-blur-xl border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-emerald-300">Uang Tunai</p>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black mt-2 text-white">{formatYuan(totalTunai)}</p>
          <p className="text-[9px] text-emerald-400/80 mt-0.5">{formatIDR(totalTunai)}</p>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-900/30 via-cyan-950/20 to-slate-900/60 backdrop-blur-xl border border-cyan-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-cyan-300">Uang Bank</p>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black mt-2 text-white">{formatYuan(totalBank)}</p>
          <p className="text-[9px] text-cyan-400/80 mt-0.5">{formatIDR(totalBank)}</p>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900/30 via-indigo-950/20 to-slate-900/60 backdrop-blur-xl border border-indigo-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-indigo-300">Total Pemasukan</p>
            <ArrowUpCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black mt-2 text-indigo-400">{formatYuan(totalPemasukan)}</p>
          <p className="text-[9px] text-indigo-300/80 mt-0.5">{formatIDR(totalPemasukan)}</p>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-900/30 via-rose-950/20 to-slate-900/60 backdrop-blur-xl border border-rose-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-rose-300">Total Pengeluaran</p>
            <ArrowDownCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-black mt-2 text-rose-400">{formatYuan(totalPengeluaran)}</p>
          <p className="text-[9px] text-rose-300/80 mt-0.5">{formatIDR(totalPengeluaran)}</p>
        </div>
      </div>

      {/* BORANG INPUT */}
      <form onSubmit={handleCreateTransaction} className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 shadow-xl space-y-5">
        <h3 className="font-extrabold text-sm flex items-center gap-2 text-purple-400">
          <Plus className="w-4 h-4 p-0.5 rounded-full bg-purple-500/20 text-purple-300" />
          <span>Tambah Catatan Transaksi</span>
        </h3>

        {/* Jenis */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTxType('pemasukan')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 border ${
              txType === 'pemasukan'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'border-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            onClick={() => setTxType('pengeluaran')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 border ${
              txType === 'pengeluaran'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                : 'border-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>
        </div>

        {/* Akun */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400">Metode / Akun</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTxAccount('Cash')}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2 border ${
                txAccount === 'Cash'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Tunai (Cash)</span>
            </button>

            <button
              type="button"
              onClick={() => setTxAccount('Bank')}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2 border ${
                txAccount === 'Bank'
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank</span>
            </button>
          </div>
        </div>

        {/* Kategori */}
        {txType === 'pengeluaran' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Kategori Pengeluaran</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTxCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    txCategory === cat
                      ? 'bg-rose-500/30 border-rose-400 text-rose-200 shadow-md'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Jumlah */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400">Jumlah Uang (Yuan)</label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="Masukkan jumlah dalam ¥ (misal: 50)"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-300/40 dark:border-slate-700/50 bg-slate-100/70 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold transition"
              required
            />
            {txAmount && !isNaN(txAmount) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                ≈ {formatIDR(parseFloat(txAmount))}
              </div>
            )}
          </div>
        </div>

        {/* Tarikh */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tanggal Transaksi</span>
          </label>
          <input
            type="date"
            value={txDate}
            onChange={(e) => setTxDate(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-slate-300/40 dark:border-slate-700/50 bg-slate-100/70 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold transition text-slate-200"
            required
          />
        </div>

        {/* Keterangan */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Keterangan</span>
          </label>
          <input
            type="text"
            placeholder="Deskripsi (misal: Beli Mie Instan / Busway)"
            value={txTitle}
            onChange={(e) => setTxTitle(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-slate-300/40 dark:border-slate-700/50 bg-slate-100/70 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold transition"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full p-4 text-white rounded-2xl font-black hover:opacity-90 transition shadow-lg active:scale-[0.99] ${
            txType === 'pemasukan'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/25'
          }`}
        >
          Simpan {txType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
        </button>
      </form>

      {/* REKOD TRANSAKSI */}
      <div className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 shadow-xl space-y-4">
        <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
          Riwayat Transaksi Keuangan
        </h3>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-300/30 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium">Belum ada transaksi yang dicatat. Mulai catat keuanganmu! 🚀</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isPemasukan = tx.tipe === 'pemasukan';
              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30 hover:border-purple-500/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        isPemasukan
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isPemasukan ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-100">{tx.keterangan}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tx.tanggal || 'Hari ini'} • <span className="font-semibold text-purple-400">{tx.metode || 'Cash'}</span> • <span className="font-semibold text-pink-400">{tx.kategori || 'Umum'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-black text-xs ${isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPemasukan ? '+' : '-'}{formatYuan(tx.nominal_yuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(tx.nominal_yuan)}</p>
                    </div>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
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
    </div>
  );
}
