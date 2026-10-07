import React, { useState, useEffect } from 'react';
import {
  Wallet,
  BookOpen,
  CreditCard,
  Wrench,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Plus,
} from 'lucide-react';

// Path ke folder src/lib
import { supabase } from '../src/lib/supabaseClient';
import { formatYuan, formatIDR } from '../src/lib/utils';

// Path ke hooks (Perhatikan huruf besar 'T' pada useTransactions)
import { useTransactions } from '../hooks/useTransactions';

// Path ke components
import PaymentTab from '../components/PaymentTab';
import ToolsTab from '../components/ToolsTab';
import AddCategoryModal from '../components/AddCategoryModal';

export default function Home() {
  // --- STATE UTAMA & TAMPILAN ---
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'keuangan' | 'kuliah' | 'pembayaran' | 'tools'
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- CUSTOM HOOKS ---
  const { transactions, loading: loadingTx, addTransaction, deleteTransaction } = useTransactions();

  // --- STATE PEMBAYARAN KULIAH ---
  const [payments, setPayments] = useState([]);
  const [selectedPaymentYear, setSelectedPaymentYear] = useState('2024/2025');
  const [editingPayment, setEditingPayment] = useState(null);

  // --- STATE KATEGORI ---
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categories, setCategories] = useState(['Makanan', 'Transportasi', 'Kebutuhan', 'Hiburan']);

  // --- STATE TOOLS (POMODORO, GPA, STICKY NOTE) ---
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState('work'); // 'work' | 'break'
  const [stickyNote, setStickyNote] = useState('');
  const [gpaCourses, setGpaCourses] = useState([
    { id: 1, name: 'Bahasa Mandarin', sks: 3, gpa: 4.0 },
    { id: 2, name: 'Algoritma & Pemrograman', sks: 4, gpa: 3.8 },
  ]);

  // --- FETCH DATA PEMBAYARAN KULIAH ---
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

  // --- POMODORO TIMER LOGIC ---
  useEffect(() => {
    let timer = null;
    if (pomoActive && pomoTime > 0) {
      timer = setInterval(() => setPomoTime((prev) => prev - 1), 1000);
    } else if (pomoTime === 0) {
      if (pomoMode === 'work') {
        setPomoMode('break');
        setPomoTime(5 * 60);
      } else {
        setPomoMode('work');
        setPomoTime(25 * 60);
      }
      setPomoActive(false);
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoTime, pomoMode]);

  // --- HANDLER PEMBAYARAN KULIAH ---
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

  // --- HANDLER KATEGORI ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    setCategories((prev) => [...prev, newCategoryInput.trim()]);
    setNewCategoryInput('');
    setShowAddCategoryModal(false);
  };

  // --- HELPER KALKULATOR GPA ---
  const calculateGPA = () => {
    if (gpaCourses.length === 0) return '0.00';
    const totalSKS = gpaCourses.reduce((sum, c) => sum + c.sks, 0);
    const totalPoints = gpaCourses.reduce((sum, c) => sum + c.sks * c.gpa, 0);
    return (totalPoints / totalSKS).toFixed(2);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* HEADER & NAVIGASI TAB */}
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
            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Toggle Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* MENU TABS */}
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
              <span>Dashboard</span>
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

        {/* --- KONTEN TAB UTAMA (DASHBOARD) --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-xs text-slate-400 font-bold">Total Transaksi</p>
                <p className="text-xl font-black mt-1">{loadingTx ? 'Memuat...' : transactions.length}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-xs text-slate-400 font-bold">Total Pembayaran Lunas</p>
                <p className="text-xl font-black mt-1 text-emerald-500">
                  {payments.filter((p) => p.sudah_dibayar).length} / {payments.length}
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <p className="text-xs text-slate-400 font-bold">Estimasi IPK</p>
                <p className="text-xl font-black mt-1 text-blue-500">{calculateGPA()}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- KONTEN TAB PEMBAYARAN KULIAH --- */}
        {activeTab === 'pembayaran' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['2023/2024', '2024/2025', '2025/2026'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedPaymentYear(year)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedPaymentYear === year
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Tahun {year}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            {/* Komponen Komponen Pembayaran Kuliah */}
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

        {/* --- KONTEN TAB FITUR TAMBAHAN (TOOLS) --- */}
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

        {/* MODAL TAMBAH KATEGORI */}
        <AddCategoryModal
          showAddCategoryModal={showAddCategoryModal}
          setShowAddCategoryModal={setShowAddCategoryModal}
          handleAddCategory={handleAddCategory}
          newCategoryInput={newCategoryInput}
          setNewCategoryInput={setNewCategoryInput}
          darkMode={darkMode}
        />

      </div>
    </div>
  );
}
