import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  Clock, AlertCircle, Edit2, ArrowUpRight, ArrowDownRight, X, Info, Trash2, Plus,
  CheckSquare, Square, AlertTriangle, ListTodo, Maximize, Minimize, Filter, RotateCcw,
  Banknote, Building2
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('keuangan');
  const [kursRate, setKursRate] = useState(2200);
  const [editingKurs, setEditingKurs] = useState(false);
  const [tempKurs, setTempKurs] = useState(2200);

  // Kategori Pengeluaran
  const expenseCategories = ['Makan', 'Minum', 'Kuota', 'Jajan', 'Belanja', 'Transportasi', 'Biaya Kuliah', 'Lain-lain'];

  // States Keuangan
  const [transactions, setTransactions] = useState([]);
  
  // STATE SORT/FILTER BULAN (Pilih bulan untuk filter 1 bulan penuh)
  const [filterMonth, setFilterMonth] = useState(''); // contoh format: '2026-09'
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [financeForm, setFinanceForm] = useState({
    tipe: 'pengeluaran',
    metode: 'Cash', // Pilihan: 'Cash' atau 'Bank'
    kategori: 'Makan',
    nominalYuan: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ''
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    fetchKurs();
    fetchTransactions();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi' }, () => fetchTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pengaturan' }, () => fetchKurs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchKurs() {
    const { data } = await supabase.from('pengaturan').select('value').eq('key', 'kurs_yuan').single();
    if (data) { setKursRate(Number(data.value)); setTempKurs(Number(data.value)); }
  }

  async function updateKurs() {
    const newRate = Number(tempKurs);
    if (!newRate) return;
    await supabase.from('pengaturan').upsert({ key: 'kurs_yuan', value: newRate });
    setKursRate(newRate);
    setEditingKurs(false);
  }

  async function fetchTransactions() {
    const { data } = await supabase.from('transaksi').select('*').order('tanggal', { ascending: false });
    if (data) setTransactions(data);
  }

  async function addTransaction(e) {
    e.preventDefault();
    if (!financeForm.nominalYuan) return;
    const yuan = Number(financeForm.nominalYuan);
    const idr = yuan * kursRate;

    await supabase.from('transaksi').insert([{
      tipe: financeForm.tipe,
      metode: financeForm.metode,
      kategori: financeForm.tipe === 'pemasukan' ? 'Pemasukan' : financeForm.kategori,
      nominal_yuan: yuan,
      nominal_idr: idr,
      tanggal: financeForm.tanggal,
      keterangan: financeForm.keterangan
    }]);

    setFinanceForm({ tipe: 'pengeluaran', metode: 'Cash', kategori: 'Makan', nominalYuan: '', tanggal: new Date().toISOString().split('T')[0], keterangan: '' });
  }

  async function updateTransaction(e) {
    e.preventDefault();
    if (!editingTransaction || !editingTransaction.nominal_yuan) return;

    const yuan = Number(editingTransaction.nominal_yuan);
    const idr = yuan * kursRate;

    await supabase.from('transaksi').update({
      tipe: editingTransaction.tipe,
      metode: editingTransaction.metode || 'Cash',
      kategori: editingTransaction.tipe === 'pemasukan' ? 'Pemasukan' : editingTransaction.kategori,
      nominal_yuan: yuan,
      nominal_idr: idr,
      tanggal: editingTransaction.tanggal,
      keterangan: editingTransaction.keterangan
    }).eq('id', editingTransaction.id);

    setEditingTransaction(null);
  }

  async function deleteTransaction(id) {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    await supabase.from('transaksi').delete().eq('id', id);
  }

  // --- LOGIKA FILTER KEUANGAN ---
  // 1. Secara default (jika filterMonth kosong): Tampilkan hanya 7 hari terakhir
  // 2. Jika filterMonth diisi (misal "2026-09"): Tampilkan khusus 1 bulan penuh
  const getFilteredTransactions = () => {
    if (filterMonth) {
      // Filter 1 Bulan tertentu
      return transactions.filter(t => t.tanggal && t.tanggal.startsWith(filterMonth));
    } else {
      // Filter 1 Minggu Terakhir (7 hari ke belakang dari sekarang)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      return transactions.filter(t => {
        if (!t.tanggal) return false;
        const txDate = new Date(t.tanggal);
        return txDate >= sevenDaysAgo && txDate <= today;
      });
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const formatYuan = (val) => `¥ ${Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatIDR = (val) => `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-5">
        
        {/* HEADER */}
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Manager</h1>
            <p className="text-xs text-slate-500">Keuangan, Kuliah & Pembayaran</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1.5 rounded-xl text-right border border-slate-200">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[10px] text-slate-500">1 RMB =</span>
                {editingKurs ? (
                  <div className="flex items-center gap-1">
                    <input type="number" value={tempKurs} onChange={(e) => setTempKurs(e.target.value)} className="w-16 bg-white border border-slate-300 text-xs rounded px-1" />
                    <button onClick={updateKurs} className="text-[10px] bg-emerald-600 px-1.5 py-0.5 text-white font-bold rounded">OK</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingKurs(true)} className="flex items-center gap-1 font-bold text-blue-600 text-xs">
                    <span>Rp {kursRate.toLocaleString('id-ID')}</span>
                    <Edit2 className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* TAB NAVIGATION */}
        <nav className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'keuangan', label: 'Keuangan', icon: Wallet }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="space-y-4">
            
            {/* FORM INPUT TRANSAKSI */}
            <form onSubmit={addTransaction} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Catat Transaksi</h2>
              
              {/* PILIHAN TIPE (PENGELUARAN / PEMASUKAN) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pengeluaran' })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    financeForm.tipe === 'pengeluaran' 
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pemasukan' })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    financeForm.tipe === 'pemasukan' 
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              {/* PILIHAN METODE (CASH / BANK) */}
              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFinanceForm({ ...financeForm, metode: 'Cash' })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                      financeForm.metode === 'Cash'
                        ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinanceForm({ ...financeForm, metode: 'Bank' })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                      financeForm.metode === 'Bank'
                        ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Bank</span>
                  </button>
                </div>
              </div>

              {financeForm.tipe === 'pengeluaran' && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Kategori Pengeluaran</label>
                  <select
                    value={financeForm.kategori}
                    onChange={(e) => setFinanceForm({ ...financeForm, kategori: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  >
                    {expenseCategories.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              )}

              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Nominal (¥ Yuan)"
                  value={financeForm.nominalYuan}
                  onChange={(e) => setFinanceForm({ ...financeForm, nominalYuan: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>

              <div>
                <input
                  type="date"
                  value={financeForm.tanggal}
                  onChange={(e) => setFinanceForm({ ...financeForm, tanggal: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Keterangan..."
                  value={financeForm.keterangan}
                  onChange={(e) => setFinanceForm({ ...financeForm, keterangan: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                Simpan Transaksi
              </button>
            </form>

            {/* RIWAYAT MUTASI */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <h2 className="font-bold text-xs text-slate-700">Riwayat Mutasi</h2>
                  <p className="text-[10px] text-slate-400">
                    {filterMonth ? `Filter Bulan: ${filterMonth}` : 'Menampilkan 1 Minggu Terakhir'}
                  </p>
                </div>

                {/* TOMBOL SORT KECIL DI POJOK KANAN ATAS */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className={`p-1.5 rounded-lg border transition flex items-center gap-1 text-[11px] font-semibold ${
                      filterMonth 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Sort / Filter Bulan"
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>

                  {/* POP-UP MENU SORT BULAN */}
                  {showSortMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-2">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                        <span className="text-[11px] font-bold text-slate-700">Sort Per Bulan</span>
                        <button onClick={() => setShowSortMenu(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Pilih 1 Bulan (Bulan & Tahun):</label>
                        <input
                          type="month"
                          value={filterMonth}
                          onChange={(e) => {
                            setFilterMonth(e.target.value);
                            setShowSortMenu(false);
                          }}
                          className="w-full border border-slate-200 p-1.5 rounded-lg text-xs bg-slate-50"
                        />
                      </div>

                      {filterMonth && (
                        <button
                          onClick={() => {
                            setFilterMonth('');
                            setShowSortMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-1 text-[10px] text-rose-600 bg-rose-50 hover:bg-rose-100 py-1.5 rounded-lg font-bold transition"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset (Kembali ke 1 Minggu)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* DAFTAR MUTASI */}
              <div className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    {filterMonth ? `Tidak ada transaksi pada bulan ${filterMonth}.` : 'Tidak ada transaksi dalam 1 minggu terakhir.'}
                  </p>
                ) : (
                  filteredTransactions.map(t => (
                    <div key={t.id} className="py-2.5 flex justify-between items-center text-xs hover:bg-slate-50/80 px-2 rounded-xl transition">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-800">{t.keterangan || t.kategori}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${
                            t.metode === 'Bank' 
                              ? 'bg-purple-50 text-purple-600 border-purple-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {t.metode || 'Cash'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{t.tanggal} • {t.kategori}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                          </p>
                          <p className="text-[10px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                        </div>

                        <button 
                          onClick={() => setEditingTransaction(t)} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => deleteTransaction(t.id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
