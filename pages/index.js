import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  Wrench,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
} from 'lucide-react';

// Path ke folder /lib
import { supabase } from '../lib/supabaseClient';
import { formatYuan, formatIDR } from '../lib/utils';

// Path ke hooks & components
import { useTransactions } from '../hooks/useTransactions';
import PaymentTab from '../components/PaymentTab';
import ToolsTab from '../components/ToolsTab';
import AddCategoryModal from '../components/AddCategoryModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom Hooks & Transactions
  const { transactions, loading: loadingTx, addTransaction, deleteTransaction } = useTransactions();

  // State Form Transaksi Baru
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Makanan');
  const [txType, setTxType] = useState('pengeluaran'); // 'pengeluaran' | 'pemasukan'

  // State Pembayaran Kuliah
  const [payments, setPayments] = useState([]);
  const [selectedPaymentYear, setSelectedPaymentYear] = useState('2024/2025');
  const [editingPayment, setEditingPayment] = useState(null);

  // State Kategori
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // State Tools
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState('work');
  const [stickyNote, setStickyNote] = useState('');
  const [gpaCourses] = useState([
    { id: 1, name: 'Bahasa Mandarin', sks: 3, gpa: 4.0 },
    { id: 2, name: 'Algoritma & Pemrograman', sks: 4, gpa: 3.8 },
  ]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) {
      setPayments(data);
    }
  };

  // Handler Submit Transaksi Keuangan
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    await addTransaction({
      judul: txTitle,
      jumlah_yuan: parseFloat(txAmount),
      kategori: txCategory,
      tipe: txType,
      tanggal: new Date().toISOString().split('T')[0],
    });

    setTxTitle('');
    setTxAmount('');
  };

  const togglePaymentStatus = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('payments')
      .update({
        sudah_dibayar: updatedStatus,
        tanggal_pembayaran: updatedStatus ? today : null,
      })
      .eq('id', id);

    if (!error) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, sudah_dibayar: updatedStatus, tanggal_pembayaran: updatedStatus ? today : null }
            : p
        )
      );
    }
  };

  const deletePayment = async (id) => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (!error) {
      setPayments((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const calculateGPA = () => {
    if (gpaCourses.length === 0) return '0.00';
    const totalSKS = gpaCourses.reduce((sum, c) => sum + c.sks, 0);
    const totalPoints = gpaCourses.reduce((sum, c) => sum + c.sks * c.gpa, 0);
    return (totalPoints / totalSKS).toFixed(2);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span>Dashboard Mahasiswa</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola keuangan, jadwal perkuliahan, dan tagihan dalam satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* TAB NAVIGATION */}
        {!isFullscreen && (
          <nav className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Dashboard Keuangan</span>
            </button>

            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'pembayaran'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Pembayaran Kuliah</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Fitur Tambahan</span>
            </button>
          </nav>
        )}

        {/* TAB DASHBOARD: RINGKASAN & PENCATATAN TRANSAKSI */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-xs text-slate-400 font-bold">Total Transaksi</p>
                <p className="text-xl font-black mt-1">{loadingTx ? '...' : transactions.length}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-xs text-slate-400 font-bold">Pembayaran Lunas</p>
                <p className="text-xl font-black mt-1 text-emerald-500">
                  {payments.filter((p) => p.sudah_dibayar).length} / {payments.length}
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-xs text-slate-400 font-bold">Estimasi IPK</p>
                <p className="text-xl font-black mt-1 text-blue-500">{calculateGPA()}</p>
              </div>
            </div>

            {/* Form Tambah Transaksi */}
            <form onSubmit={handleCreateTransaction} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-3`}>
              <h3 className="font-bold text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Tambah Catatan Transaksi Baru</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nama Catatan (misal: Makan Siang)"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 col-span-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Jumlah (¥ Yuan)"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
                <button type="submit" className="py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                  Simpan Transaksi
                </button>
              </div>
            </form>

            {/* Daftar Riwayat Transaksi */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-3`}>
              <h3 className="font-bold text-xs">Riwayat Transaksi Keuangan</h3>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi yang dicatat.</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <p className="font-bold">{tx.judul}</p>
                        <p className="text-[10px] text-slate-400">{tx.tanggal || 'Hari ini'} • {tx.kategori || 'Umum'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-extrabold text-xs">{formatYuan(tx.jumlah_yuan)}</p>
                          <p className="text-[9px] text-slate-400">{formatIDR(tx.jumlah_yuan)}</p>
                        </div>
                        <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg">
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

        {/* TAB PEMBAYARAN KULIAH */}
        {activeTab === 'pembayaran' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['2023/2024', '2024/2025', '2025/2026'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedPaymentYear(year)}
                    className={`px-3 py-1.5 rounded-xl text-
