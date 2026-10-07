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
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
} from 'lucide-react';

// FIX PATH: Menggunakan ../lib/
import { supabase } from '../lib/supabaseClient';
import { formatYuan, formatIDR } from '../lib/utils';

import { useTransactions } from '../hooks/useTransactions';
import PaymentTab from '../components/PaymentTab';
import ToolsTab from '../components/ToolsTab';
import AddCategoryModal from '../components/AddCategoryModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { transactions, loading: loadingTx, addTransaction, deleteTransaction } = useTransactions();

  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Makanan');
  const [txType, setTxType] = useState('pengeluaran');

  const [payments, setPayments] = useState([]);
  const [selectedPaymentYear, setSelectedPaymentYear] = useState('2024/2025');
  const [editingPayment, setEditingPayment] = useState(null);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

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
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* Background Ornamen Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-2 shadow-lg shadow-purple-500/25">
              <Sparkles className="w-3 h-3" /> Student Space 2.0
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard Remaja
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Atur dompet, bayar kuliah, & produktif tanpa ribet ✨
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 text-slate-400 hover:text-white bg-slate-200/50 dark:bg-slate-800/50 hover:bg-purple-600/20 rounded-2xl transition border border-slate-300/30 dark:border-slate-700/30"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 text-slate-400 hover:text-white bg-slate-200/50 dark:bg-slate-800/50 hover:bg-pink-500/20 rounded-2xl transition border border-slate-300/30 dark:border-slate-700/30"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* NAVIGATION PILLS */}
        {!isFullscreen && (
          <nav className="flex gap-3 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Dompet & Catatan</span>
            </button>

            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`flex-1 py-3 px-5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'pembayaran'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Tagihan Kuliah</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-3 px-5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'tools'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Zone Produktif</span>
            </button>
          </nav>
        )}

        {/* TAB DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-slate-900/60 backdrop-blur-xl border border-purple-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-purple-300">Total Transaksi</p>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-3xl font-black mt-2 tracking-tight text-white">
                  {loadingTx ? '...' : transactions.length}
                </p>
                <p className="text-[10px] text-purple-400/80 mt-1">Aktivitas tercatat</p>
              </div>

              <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-emerald-900/40 via-emerald-950/20 to-slate-900/60 backdrop-blur-xl border border-emerald-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-300">Lunas Pembayaran</p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-black mt-2 tracking-tight text-emerald-400">
                  {payments.filter((p) => p.sudah_dibayar).length} <span className="text-sm font-normal text-slate-400">/ {payments.length}</span>
                </p>
                <p className="text-[10px] text-emerald-400/80 mt-1">Status UKT / Biaya</p>
              </div>

              <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-cyan-900/40 via-cyan-950/20 to-slate-900/60 backdrop-blur-xl border border-cyan-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-cyan-300">Estimasi IPK</p>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-3xl font-black mt-2 tracking-tight text-cyan-400">
                  {calculateGPA()}
                </p>
                <p className="text-[10px] text-cyan-400/80 mt-1">Target Semester Ini</p>
              </div>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 shadow-xl space-y-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-purple-400">
                <Plus className="w-4 h-4 p-0.5 rounded-full bg-purple-500/20 text-purple-300" />
                <span>Tambah Catatan Transaksi</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Keterangan (misal: Boba Milk Tea)"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="p-3.5 rounded-2xl border border-slate-300/40 dark:border-slate-700/50 bg-slate-100/70 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2 transition"
                  required
                />
                <input
                  type="number"
                  placeholder="Jumlah (¥ Yuan)"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="p-3.5 rounded-2xl border border-slate-300/40 dark:border-slate-700/50 bg-slate-100/70 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  required
                />
                <button
                  type="submit"
                  className="p-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black hover:opacity-90 transition shadow-lg shadow-purple-500/25 active:scale-95"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>

            <div className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 shadow-xl space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
                Riwayat Transaksi Terakhir
              </h3>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-300/30 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium">Belum ada pengeluaran hari ini. Tetap hemat! 🚀</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30 hover:border-purple-500/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-slate-100">{tx.judul}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {tx.tanggal || 'Hari ini'} • <span className="text-purple-400 font-semibold">{tx.kategori || 'Umum'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-xs text-pink-400">{formatYuan(tx.jumlah_yuan)}</p>
                          <p className="text-[9px] text-slate-400">{formatIDR(tx.jumlah_yuan)}</p>
                        </div>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
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
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition ${
                      selectedPaymentYear === year
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                        : 'bg-slate-800/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tahun {year}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-2xl text-xs font-extrabold transition border border-purple-500/30"
              >
                <Plus className="w-4 h-4" />
                <span>Kategori Baru</span>
              </button>
            </div>

            <PaymentTab
              payments={payments}
              selectedPaymentYear={selectedPaymentYear}
              darkMode={darkMode}
              togglePaymentStatus={togglePaymentStatus}
              setEditingPayment={setEditingPayment}
              deletePayment={deletePayment}
            />
          </div>
        )}

        {/* TAB FITUR TAMBAHAN */}
        {activeTab === 'tools' && (
          <ToolsTab
            darkMode={darkMode}
            isFullscreen={isFullscreen}
            pomoMode={pomoMode}
            pomoTime={pomoTime}
            pomoActive={pomoActive}
            setPomoActive={setPomoActive}
            setPomoTime={setPomoTime}
            setPomoMode={setPomoMode}
            calculateGPA={calculateGPA}
            gpaCourses={gpaCourses}
            stickyNote={stickyNote}
            setStickyNote={setStickyNote}
          />
        )}

        {/* MODAL */}
        <AddCategoryModal
          showAddCategoryModal={showAddCategoryModal}
          setShowAddCategoryModal={setShowAddCategoryModal}
          handleAddCategory={(e) => {
            e.preventDefault();
            setShowAddCategoryModal(false);
          }}
          newCategoryInput={newCategoryInput}
          setNewCategoryInput={setNewCategoryInput}
          darkMode={darkMode}
        />

      </div>
    </div>
  );
}
