import React, { useState } from 'react';
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
  Check,
  Filter,
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

export default function KeuanganTab({
  transactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
}) {
  // State Form Tambah
  const [txType, setTxType] = useState('pemasukan');
  const [txAccount, setTxAccount] = useState('Cash');
  const [txCategory, setTxCategory] = useState('Makan');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txTitle, setTxTitle] = useState('');

  // State Filter & Edit Modal
  const [showOnlyLastWeek, setShowOnlyLastWeek] = useState(true);
  const [editingTx, setEditingTx] = useState(null); // Data transaksi yang sedang diedit

  // Hitung Total Keuangan
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

  // Tambah Transaksi
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

  // Simpan Perubahan Edit
  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editingTx || !editingTx.keterangan || !editingTx.nominal_yuan) return;

    if (editTransaction) {
      await editTransaction(editingTx.id, {
        keterangan: editingTx.keterangan,
        nominal_yuan: parseFloat(editingTx.nominal_yuan),
        metode: editingTx.metode,
        kategori: editingTx.tipe === 'pengeluaran' ? editingTx.kategori : 'Pemasukan',
        tipe: editingTx.tipe,
        tanggal: editingTx.tanggal,
      });
    }
    setEditingTx(null);
  };

  // Filter 1 Minggu Terakhir (7 Hari Lalu)
  const filteredTransactions = transactions.filter((tx) => {
    if (!showOnlyLastWeek) return true;
    if (!tx.tanggal) return true;

    const txDateObj = new Date(tx.tanggal);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    return txDateObj >= sevenDaysAgo && txDateObj <= today;
  });

  return (
    <div className="space-y-6">
      {/* RINGKASAN KEUANGAN (4 KARTU) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">Uang Tunai</span>
            <Banknote className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{formatYuan(totalTunai)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatIDR(totalTunai)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">Uang Bank</span>
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{formatYuan(totalBank)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatIDR(totalBank)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">Total Pemasukan</span>
            <ArrowUpCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-300 mt-2">{formatYuan(totalPemasukan)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatIDR(totalPemasukan)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">Total Pengeluaran</span>
            <ArrowDownCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{formatYuan(totalPengeluaran)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatIDR(totalPengeluaran)}</p>
        </div>
      </div>

      {/* FORM TAMBAH TRANSAKSI */}
      <form onSubmit={handleCreateTransaction} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <h3 className="text-sm font-extrabold text-purple-400 flex items-center gap-2">
          <Plus className="w-4 h-4 p-0.5 rounded-full bg-purple-500/20 text-purple-300" />
          <span>Tambah Catatan Transaksi</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTxType('pemasukan')}
            className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
              txType === 'pemasukan'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setTxType('pengeluaran')}
            className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
              txType === 'pengeluaran'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Pengeluaran
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">Metode / Akun</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTxAccount('Cash')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                txAccount === 'Cash'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <Banknote className="w-4 h-4" />
              Tunai (Cash)
            </button>
            <button
              type="button"
              onClick={() => setTxAccount('Bank')}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                txAccount === 'Bank'
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Bank
            </button>
          </div>
        </div>

        {txType === 'pengeluaran' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTxCategory(cat)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                    txCategory === cat
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">Jumlah Uang (Yuan)</label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="Masukkan jumlah dalam ¥ (misal: 50)"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {txAmount && !isNaN(txAmount) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                ≈ {formatIDR(parseFloat(txAmount))}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tanggal
            </label>
            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Keterangan
            </label>
            <input
              type="text"
              placeholder="Deskripsi (misal: Beli Mie Instan)"
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className={`w-full p-3.5 rounded-xl text-xs font-black text-white shadow-lg transition ${
            txType === 'pemasukan'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90'
              : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-90'
          }`}
        >
          Simpan {txType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
        </button>
      </form>

      {/* RIWAYAT TRANSAKSI DENGAN FILTER 1 MINGGU TERAKHIR */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Riwayat Transaksi Keuangan
          </h3>

          {/* Toggle Filter 1 Minggu Terakhir */}
          <button
            type="button"
            onClick={() => setShowOnlyLastWeek(!showOnlyLastWeek)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              showOnlyLastWeek
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showOnlyLastWeek ? '1 Minggu Terakhir' : 'Tampilkan Semua'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium">
                {showOnlyLastWeek
                  ? 'Tidak ada transaksi dalam 1 minggu terakhir. 🚀'
                  : 'Belum ada transaksi yang dicatat.'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
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
                  className={`py-2.5 rounded-xl text-xs font-bold border ${
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
                  className={`py-2.5 rounded-xl text-xs font-bold border ${
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

              {/* Jumlah (Yuan) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Jumlah Uang (Yuan)</label>
                <input
                  type="number"
                  step="any"
                  value={editingTx.nominal_yuan || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, nominal_yuan: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
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

              {/* Metode */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Metode / Akun</label>
                <select
                  value={editingTx.metode || 'Cash'}
                  onChange={(e) => setEditingTx({ ...editingTx, metode: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Cash">Cash / Tunai</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

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
