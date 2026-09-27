import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  Clock, AlertCircle, Edit2, ArrowUpRight, ArrowDownRight, X, Info, Trash2, Plus,
  CheckSquare, Square, AlertTriangle, ListTodo, Maximize, Minimize
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('keuangan');
  const [kursRate, setKursRate] = useState(2200);
  const [editingKurs, setEditingKurs] = useState(false);
  const [tempKurs, setTempKurs] = useState(2200);

  // State Jam Live & Fullscreen
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  // Kategori Pengeluaran
  const expenseCategories = ['Makan', 'Minum', 'Kuota', 'Jajan', 'Belanja', 'Transportasi', 'Biaya Kuliah', 'Lain-lain'];

  // States Keuangan
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [financeForm, setFinanceForm] = useState({
    tipe: 'pengeluaran',
    kategori: 'Makan',
    nominalYuan: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ''
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  // States Kuliah & Kalender
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);
  const [agendaForm, setAgendaForm] = useState({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date().toISOString().split('T')[0],
    jam: '09:00',
    jam_selesai: '10:00',
    seharian: false,
    keterangan: ''
  });

  // States Pembayaran Kuliah
  const [payments, setPayments] = useState([]);
  const [selectedPaymentYear, setSelectedPaymentYear] = useState('Tahun Bahasa');
  const [editingDueDateId, setEditingDueDateId] = useState(null);
  const [tempDueDate, setTempDueDate] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);
  const [newPaymentForm, setNewPaymentForm] = useState({
    nama_tagihan: '',
    jumlah_yuan: '',
    tenggat_waktu: ''
  });

  // States To Do List Tugas
  const [todos, setTodos] = useState([]);
  const [todoForm, setTodoForm] = useState({
    judul: '',
    tenggat_waktu: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    fetchKurs();
    fetchTransactions();
    fetchEvents();
    fetchPayments();
    fetchTodos();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi' }, () => fetchTransactions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_kuliah' }, () => fetchEvents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pembayaran_kuliah' }, () => fetchPayments())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todo_tugas' }, () => fetchTodos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pengaturan' }, () => fetchKurs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (fullscreenRef.current?.requestFullscreen) fullscreenRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

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
      kategori: financeForm.tipe === 'pemasukan' ? 'Pemasukan' : financeForm.kategori,
      nominal_yuan: yuan,
      nominal_idr: idr,
      tanggal: financeForm.tanggal,
      keterangan: financeForm.keterangan
    }]);

    setFinanceForm({ tipe: 'pengeluaran', kategori: 'Makan', nominalYuan: '', tanggal: new Date().toISOString().split('T')[0], keterangan: '' });
  }

  async function updateTransaction(e) {
    e.preventDefault();
    if (!editingTransaction || !editingTransaction.nominal_yuan) return;

    const yuan = Number(editingTransaction.nominal_yuan);
    const idr = yuan * kursRate;

    await supabase.from('transaksi').update({
      tipe: editingTransaction.tipe,
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

  async function fetchEvents() {
    const { data } = await supabase.from('agenda_kuliah').select('*').order('tanggal', { ascending: true });
    if (data) setEvents(data);
  }

  async function fetchPayments() {
    const { data } = await supabase.from('pembayaran_kuliah').select('*').order('id', { ascending: true });
    if (data) setPayments(data);
  }

  async function fetchTodos() {
    const { data } = await supabase.from('todo_tugas').select('*').order('selesai', { ascending: true }).order('tenggat_waktu', { ascending: true });
    if (data) setTodos(data);
  }

  const formatYuan = (val) => `¥ ${Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatIDR = (val) => `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  return (
    <div ref={fullscreenRef} className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
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
            { id: 'dashboard', label: 'Utama', icon: LayoutDashboard },
            { id: 'todo', label: 'To Do Tugas', icon: CheckSquare },
            { id: 'keuangan', label: 'Keuangan', icon: Wallet },
            { id: 'kuliah', label: 'Kuliah', icon: CalendarIcon },
            { id: 'pembayaran', label: 'Pembayaran', icon: GraduationCap }
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
              <h2 className="font-bold text-xs text-slate-700">Catat Transaksi Baru</h2>
              
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

              {/* DROPDOWN KATEGORI (Hanya tampil jika jenisnya Pengeluaran) */}
              {financeForm.tipe === 'pengeluaran' && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Kategori Pengeluaran</label>
                  <select
                    value={financeForm.kategori}
                    onChange={(e) => setFinanceForm({ ...financeForm, kategori: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {expenseCategories.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Nominal Yuan (¥)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Nominal (¥ Yuan)"
                  value={financeForm.nominalYuan}
                  onChange={(e) => setFinanceForm({ ...financeForm, nominalYuan: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={financeForm.tanggal}
                  onChange={(e) => setFinanceForm({ ...financeForm, tanggal: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  placeholder="Keterangan..."
                  value={financeForm.keterangan}
                  onChange={(e) => setFinanceForm({ ...financeForm, keterangan: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                Simpan Transaksi
              </button>
            </form>

            {/* RIWAYAT MUTASI DENGAN TOMBOL EDIT & HAPUS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="font-bold text-xs text-slate-700">Riwayat Mutasi</h2>
              <div className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada riwayat transaksi.</p>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="py-2.5 flex justify-between items-center text-xs group hover:bg-slate-50/80 px-2 rounded-xl transition">
                      <div>
                        <p className="font-bold text-slate-800">{t.keterangan || t.kategori}</p>
                        <p className="text-[10px] text-slate-400">{t.tanggal} • {t.kategori}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                          </p>
                          <p className="text-[10px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                        </div>

                        {/* TOMBOL EDIT */}
                        <button 
                          onClick={() => setEditingTransaction(t)} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* TOMBOL HAPUS */}
                        <button 
                          onClick={() => deleteTransaction(t.id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Transaksi"
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

        {/* MODAL POP-UP EDIT TRANSAKSI KEUANGAN */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Edit Transaksi</h3>
                <button 
                  onClick={() => setEditingTransaction(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={updateTransaction} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTransaction({ ...editingTransaction, tipe: 'pengeluaran' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      editingTransaction.tipe === 'pengeluaran' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTransaction({ ...editingTransaction, tipe: 'pemasukan' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      editingTransaction.tipe === 'pemasukan' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Pemasukan
                  </button>
                </div>

                {editingTransaction.tipe === 'pengeluaran' && (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Kategori</label>
                    <select
                      value={editingTransaction.kategori}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, kategori: e.target.value })}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                    >
                      {expenseCategories.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Nominal Yuan (¥)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingTransaction.nominal_yuan}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, nominal_yuan: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal</label>
                  <input
                    type="date"
                    value={editingTransaction.tanggal}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, tanggal: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Keterangan</label>
                  <input
                    type="text"
                    value={editingTransaction.keterangan || ''}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, keterangan: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(null)}
                    className="w-1/2 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
