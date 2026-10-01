import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  Clock, Edit2, X, Trash2, Plus, CheckSquare, Square, ListTodo, 
  Maximize, Minimize, Filter, RefreshCw, CreditCard, Banknote,
  Search, Download, AlertTriangle, Target, Calculator, Moon, Sun,
  Pin, StickyNote, PieChart, CheckCircle2, Bookmark, Flame, Upload,
  DollarSign, Percent, FileText, Check, Award, ArrowUpRight, ArrowDownRight,
  Sparkles, ShieldCheck, Heart, MessageSquare, ExternalLink, Droplet
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getCurrentMonthKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kursRate, setKursRate] = useState(2200);
  const [editingKurs, setEditingKurs] = useState(false);
  const [tempKurs, setTempKurs] = useState(2200);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // State Jam Live CST & Fullscreen
  const [cstTimeString, setCstTimeString] = useState('');
  const [cstDateString, setCstDateString] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  // Kategori Pengeluaran
  const [expenseCategories, setExpenseCategories] = useState([
    'Makan', 'Minum', 'Kuota', 'Jajan', 'Belanja', 'Transportasi', 'Biaya Kuliah', 'Lain-lain'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // States Keuangan
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [filterMonthMutasi, setFilterMonthMutasi] = useState('');
  const [filterCategoryMutasi, setFilterCategoryMutasi] = useState('');
  const [filterPaymentMethodMutasi, setFilterPaymentMethodMutasi] = useState('');
  const [searchMutasi, setSearchMutasi] = useState('');
  const [sortMutasiOrder, setSortMutasiOrder] = useState('date-desc');
  const [showFilterSort, setShowFilterSort] = useState(false);
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(3000); 
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState(100);
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(3000);

  // Pinned Transactions State
  const [pinnedTxIds, setPinnedTxIds] = useState([]);

  // State Fitur Prioritas & Search Todo
  const [todoFilterPriority, setTodoFilterPriority] = useState('all');
  const [searchTodo, setSearchTodo] = useState('');

  const [financeForm, setFinanceForm] = useState({
    tipe: 'pengeluaran',
    kategori: 'Makan',
    metode_pembayaran: 'Cash',
    nominalYuan: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ''
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  // States Kuliah & Kalender
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);
  const [searchAgenda, setSearchAgenda] = useState('');

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

  // Sticky Notes State
  const [stickyNote, setStickyNote] = useState('');

  // 20 Fitur Additional State
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState('work'); 
  const [streakCount] = useState(1);

  const [savingsGoals, setSavingsGoals] = useState([
    { id: 1, name: 'Beli Laptop Baru', targetYuan: 5000, currentYuan: 2200 },
    { id: 2, name: 'Tiket Pulang Indo', targetYuan: 3000, currentYuan: 1500 }
  ]);
  const [newGoalForm, setNewGoalForm] = useState({ name: '', targetYuan: '' });

  const [gpaCourses, setGpaCourses] = useState([
    { id: 1, name: 'Bahasa Mandarin', gpa: 4.0, sks: 4 },
    { id: 2, name: 'Matematika Diskrit', gpa: 3.5, sks: 3 }
  ]);
  const [newCourse, setNewCourse] = useState({ name: '', gpa: 4.0, sks: 3 });

  const [wishlist, setWishlist] = useState([
    { id: 1, title: 'Sepatu Running', priceYuan: 299, bought: false },
    { id: 2, title: 'Monitor Tambahan 24 inch', priceYuan: 650, bought: false }
  ]);
  const [newWishItem, setNewWishItem] = useState({ title: '', priceYuan: '' });

  const [bookmarks, setBookmarks] = useState([
    { id: 1, title: 'Portal Kampus', url: 'https://portal.university.edu' },
    { id: 2, title: 'Perpustakaan Digital', url: 'https://library.university.edu' }
  ]);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' });

  const [subscriptions] = useState([
    { id: 1, name: 'Sewa Wifi Koin/Kamar', amountYuan: 80, dueDateDay: 5 },
    { id: 2, name: 'Spotify / iCloud', amountYuan: 15, dueDateDay: 15 }
  ]);

  const [splitBillAmount, setSplitBillAmount] = useState('');
  const [splitBillPeople, setSplitBillPeople] = useState('2');
  const [hideBalance, setHideBalance] = useState(false);

  const [emergencyContacts] = useState([
    { role: 'Keamanan Kampus / Int. Office', phone: '+86 1234 5678' },
    { role: 'Kedutaan / KBRI Tiongkok', phone: '+86 10 6532 5488' }
  ]);

  const [waterGlasses, setWaterGlasses] = useState(0);

  const exportFullBackupJSON = () => {
    const backupData = {
      transactions,
      todos,
      events,
      payments,
      savingsGoals,
      wishlist,
      stickyNote,
      expenseCategories,
      backupDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `student_manager_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackupJSON = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.todos) setTodos(parsed.todos);
          if (parsed.events) setEvents(parsed.events);
          if (parsed.payments) setPayments(parsed.payments);
          if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
          if (parsed.wishlist) setWishlist(parsed.wishlist);
          if (parsed.stickyNote) setStickyNote(parsed.stickyNote);
          alert('Backup berhasil dipulihkan!');
        } catch (err) {
          alert('Format file JSON backup tidak valid!');
        }
      };
    }
  };

  // Timer Effect Pomodoro
  useEffect(() => {
    let interval = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (pomoTime === 0 && pomoActive) {
      setPomoActive(false);
      alert(pomoMode === 'work' ? 'Sesi Fokus Selesai! Waktunya Istirahat.' : 'Waktu Istirahat Selesai! Kembali Belajar.');
      setPomoMode(pomoMode === 'work' ? 'break' : 'work');
      setPomoTime(pomoMode === 'work' ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime, pomoMode]);

  useEffect(() => {
    const savedNote = localStorage.getItem('app_sticky_note');
    if (savedNote) setStickyNote(savedNote);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_sticky_note', stickyNote);
    }
  }, [stickyNote]);

  // Clock CST
  useEffect(() => {
    const updateCSTClock = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      });
      const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Shanghai',
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      setCstTimeString(timeFormatter.format(now).replace(/\./g, ':'));
      setCstDateString(dateFormatter.format(now));
    };

    updateCSTClock();
    const timer = setInterval(updateCSTClock, 1000);
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

  // API CALLS
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

  async function addTransaction(e, customPayload = null) {
    if (e) e.preventDefault();
    const target = customPayload || financeForm;
    if (!target.nominalYuan) return;
    const yuan = Number(target.nominalYuan);
    const idr = yuan * kursRate;

    await supabase.from('transaksi').insert([{
      tipe: target.tipe,
      kategori: target.tipe === 'pemasukan' ? 'Pemasukan' : target.kategori,
      metode_pembayaran: target.metode_pembayaran || 'Cash',
      nominal_yuan: yuan,
      nominal_idr: idr,
      tanggal: target.tanggal,
      keterangan: target.keterangan
    }]);

    setFinanceForm({
      tipe: 'pengeluaran',
      kategori: 'Makan',
      metode_pembayaran: 'Cash',
      nominalYuan: '',
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: ''
    });
  }

  const handleQuickPreset = (kategori, nominal, ket) => {
    addTransaction(null, {
      tipe: 'pengeluaran',
      kategori: kategori,
      metode_pembayaran: 'Cash',
      nominalYuan: nominal,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: ket
    });
  };

  async function updateTransaction(e) {
    e.preventDefault();
    if (!editingTransaction || !editingTransaction.nominal_yuan) return;

    const yuan = Number(editingTransaction.nominal_yuan);
    const idr = yuan * kursRate;

    await supabase.from('transaksi').update({
      tipe: editingTransaction.tipe,
      kategori: editingTransaction.tipe === 'pemasukan' ? 'Pemasukan' : editingTransaction.kategori,
      metode_pembayaran: editingTransaction.metode_pembayaran || 'Cash',
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

  const exportTransactionsToCSV = () => {
    if (filteredMutasiTransactions.length === 0) {
      alert('Tidak ada transaksi untuk diekspor!');
      return;
    }

    const headers = ['Tanggal,Tipe,Kategori,Metode Pembayaran,Nominal Yuan,Nominal IDR,Keterangan'];
    const rows = filteredMutasiTransactions.map(t => [
      `"${t.tanggal}"`,
      `"${t.tipe}"`,
      `"${t.kategori}"`,
      `"${t.metode_pembayaran || 'Cash'}"`,
      t.nominal_yuan,
      t.nominal_idr,
      `"${(t.keterangan || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mutasi_transaksi_${filterMonthMutasi || 'terakhir'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTodosToCSV = () => {
    if (todos.length === 0) return alert('Daftar tugas kosong!');
    const headers = ['Judul,Tenggat Waktu,Status'];
    const rows = todos.map(t => [
      `"${t.judul.replace(/"/g, '""')}"`,
      `"${t.tenggat_waktu}"`,
      `"${t.selesai ? 'Selesai' : 'Belum Selesai'}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `todo_tugas_kuliah.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function fetchEvents() {
    const { data } = await supabase.from('agenda_kuliah').select('*').order('tanggal', { ascending: true });
    if (data) setEvents(data);
  }

  async function addAgenda(e) {
    e.preventDefault();
    if (!agendaForm.judul.trim()) { alert('Silakan isi Judul agenda!'); return; }

    const payload = {
      judul: agendaForm.judul,
      tanggal: agendaForm.tanggal,
      tanggal_selesai: agendaForm.tanggal_selesai || agendaForm.tanggal,
      jam: agendaForm.seharian ? '00:00' : (agendaForm.jam || '09:00'),
      jam_selesai: agendaForm.seharian ? '23:59' : (agendaForm.jam_selesai || '10:00'),
      seharian: agendaForm.seharian,
      keterangan: agendaForm.keterangan
    };

    const { error } = await supabase.from('agenda_kuliah').insert([payload]);
    if (error) { alert('Gagal menyimpan agenda: ' + error.message); return; }

    setAgendaForm({ 
      judul: '', 
      tanggal: new Date().toISOString().split('T')[0], 
      tanggal_selesai: new Date().toISOString().split('T')[0],
      jam: '09:00', jam_selesai: '10:00', seharian: false, keterangan: '' 
    });
    alert('Agenda berhasil disimpan!');
  }

  async function deleteAgenda(id) {
    if (!window.confirm('Hapus agenda ini?')) return;
    await supabase.from('agenda_kuliah').delete().eq('id', id);
    if (selectedDateEvents) {
      setSelectedDateEvents(prev => ({ ...prev, list: prev.list.filter(ev => ev.id !== id) }));
    }
  }

  async function fetchPayments() {
    const { data } = await supabase.from('pembayaran_kuliah').select('*').order('id', { ascending: true });
    if (data) setPayments(data);
  }

  async function togglePaymentStatus(id, currentStatus) {
    await supabase.from('pembayaran_kuliah').update({
      sudah_dibayar: !currentStatus,
      tanggal_pembayaran: !currentStatus ? new Date().toISOString().split('T')[0] : null
    }).eq('id', id);
  }

  async function saveDueDate(id) {
    await supabase.from('pembayaran_kuliah').update({ tenggat_waktu: tempDueDate || null }).eq('id', id);
    setEditingDueDateId(null);
  }

  async function addPayment(e) {
    e.preventDefault();
    if (!newPaymentForm.nama_tagihan || !newPaymentForm.jumlah_yuan) return;

    await supabase.from('pembayaran_kuliah').insert([{
      kategori_tahun: selectedPaymentYear,
      nama_tagihan: newPaymentForm.nama_tagihan,
      jumlah_yuan: Number(newPaymentForm.jumlah_yuan),
      sudah_dibayar: false,
      tenggat_waktu: newPaymentForm.tenggat_waktu || null
    }]);

    setNewPaymentForm({ nama_tagihan: '', jumlah_yuan: '', tenggat_waktu: '' });
  }

  async function updatePayment(e) {
    e.preventDefault();
    if (!editingPayment || !editingPayment.nama_tagihan || !editingPayment.jumlah_yuan) return;

    await supabase.from('pembayaran_kuliah').update({
      nama_tagihan: editingPayment.nama_tagihan,
      jumlah_yuan: Number(editingPayment.jumlah_yuan),
      tenggat_waktu: editingPayment.tenggat_waktu || null
    }).eq('id', editingPayment.id);

    setEditingPayment(null);
  }

  async function deletePayment(id) {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) return;
    await supabase.from('pembayaran_kuliah').delete().eq('id', id);
  }

  async function fetchTodos() {
    const { data } = await supabase.from('todo_tugas').select('*').order('selesai', { ascending: true }).order('tenggat_waktu', { ascending: true });
    if (data) setTodos(data);
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!todoForm.judul.trim()) return;

    const { error } = await supabase.from('todo_tugas').insert([{
      judul: todoForm.judul,
      tenggat_waktu: todoForm.tenggat_waktu,
      selesai: false
    }]);

    if (error) { alert('Gagal menambah tugas: ' + error.message); return; }
    setTodoForm({ judul: '', tenggat_waktu: new Date().toISOString().split('T')[0] });
  }

  async function toggleTodoStatus(id, currentStatus) {
    await supabase.from('todo_tugas').update({ selesai: !currentStatus }).eq('id', id);
  }

  async function markAllTodosDone() {
    if (!window.confirm('Tandai semua tugas sebagai selesai?')) return;
    const uncompleted = todos.filter(t => !t.selesai);
    for (let t of uncompleted) {
      await supabase.from('todo_tugas').update({ selesai: true }).eq('id', t.id);
    }
    fetchTodos();
  }

  async function deleteTodo(id) {
    if (!window.confirm('Hapus tugas ini dari To-Do list?')) return;
    await supabase.from('todo_tugas').delete().eq('id', id);
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    if (expenseCategories.includes(newCategoryInput.trim())) {
      alert('Kategori sudah ada!');
      return;
    }
    setExpenseCategories([...expenseCategories, newCategoryInput.trim()]);
    setFinanceForm({ ...financeForm, kategori: newCategoryInput.trim() });
    setNewCategoryInput('');
    setShowAddCategoryModal(false);
  };

  const togglePinTx = (id) => {
    if (pinnedTxIds.includes(id)) {
      setPinnedTxIds(pinnedTxIds.filter(pId => pId !== id));
    } else {
      setPinnedTxIds([...pinnedTxIds, id]);
    }
  };

  const getAutoPriority = (dueDateStr) => {
    if (!dueDateStr) return { label: 'Rendah', code: 'low', badgeColor: 'bg-slate-100 text-slate-600', blockBg: 'bg-slate-50 border-slate-100' };
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const dueObj = new Date(dueDateStr);
    dueObj.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueObj - todayObj) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return { label: 'Tinggi', code: 'high', badgeColor: 'bg-rose-500 text-white font-bold', blockBg: 'bg-rose-50/80 border-rose-200' };
    if (diffDays <= 3) return { label: 'Sedang', code: 'medium', badgeColor: 'bg-amber-500 text-white font-semibold', blockBg: 'bg-amber-50/80 border-amber-200' };
    return { label: 'Rendah', code: 'low', badgeColor: 'bg-slate-200 text-slate-700', blockBg: 'bg-slate-50/50 border-slate-100' };
  };

  const formatYuan = (val) => hideBalance ? '¥ ***' : `¥ ${Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatIDR = (val) => hideBalance ? 'Rp ***' : `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  // Logika Keuangan
  const totalIncomeAllTime = transactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const totalExpenseAllTime = transactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const totalRemainingBalanceYuan = totalIncomeAllTime - totalExpenseAllTime;

  const cashIncomeAllTime = transactions.filter(t => t.tipe === 'pemasukan' && (t.metode_pembayaran === 'Cash' || !t.metode_pembayaran)).reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const cashExpenseAllTime = transactions.filter(t => t.tipe === 'pengeluaran' && (t.metode_pembayaran === 'Cash' || !t.metode_pembayaran)).reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const totalCashBalanceYuan = cashIncomeAllTime - cashExpenseAllTime;

  const bankIncomeAllTime = transactions.filter(t => t.tipe === 'pemasukan' && t.metode_pembayaran === 'Bank').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const bankExpenseAllTime = transactions.filter(t => t.tipe === 'pengeluaran' && t.metode_pembayaran === 'Bank').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const totalBankBalanceYuan = bankIncomeAllTime - bankExpenseAllTime;

  const currentMonthTransactions = transactions.filter(t => t.tanggal.startsWith(selectedMonth));
  const monthIncomeYuan = currentMonthTransactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthExpenseYuan = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthBalanceYuan = monthIncomeYuan - monthExpenseYuan;
  
  const monthCashIncome = currentMonthTransactions.filter(t => t.tipe === 'pemasukan' && (t.metode_pembayaran === 'Cash' || !t.metode_pembayaran)).reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthCashExpense = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran' && (t.metode_pembayaran === 'Cash' || !t.metode_pembayaran)).reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthCashBalanceYuan = monthCashIncome - monthCashExpense;

  const monthBankIncome = currentMonthTransactions.filter(t => t.tipe === 'pemasukan' && t.metode_pembayaran === 'Bank').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthBankExpense = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran' && t.metode_pembayaran === 'Bank').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthBankBalanceYuan = monthBankIncome - monthBankExpense;

  const monthNonCollegeExpenseYuan = currentMonthTransactions
    .filter(t => t.tipe === 'pengeluaran' && t.kategori !== 'Biaya Kuliah')
    .reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);

  const todayDateObj = new Date();
  const currentDayOfMonth = todayDateObj.getDate() || 1;
  const dailyAverageExpense = monthExpenseYuan / currentDayOfMonth;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenseYuan = transactions
    .filter(t => t.tanggal === todayStr && t.tipe === 'pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);

  const getTopExpenseCategory = () => {
    const categoryTotals = {};
    currentMonthTransactions
      .filter(t => t.tipe === 'pengeluaran')
      .forEach(t => {
        categoryTotals[t.kategori] = (categoryTotals[t.kategori] || 0) + Number(t.nominal_yuan);
      });
    
    let topCat = '-';
    let maxAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCat = cat;
      }
    });
    return { name: topCat, amount: maxAmount };
  };
  const topExpense = getTopExpenseCategory();

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const filteredMutasiTransactions = transactions.filter(t => {
    let matchesMonth = true;
    if (filterMonthMutasi) {
      matchesMonth = t.tanggal.startsWith(filterMonthMutasi);
    } else {
      const tDate = new Date(t.tanggal);
      matchesMonth = tDate >= sevenDaysAgo && tDate <= now;
    }

    let matchesCategory = true;
    if (filterCategoryMutasi) {
      matchesCategory = t.kategori === filterCategoryMutasi;
    }

    let matchesMethod = true;
    if (filterPaymentMethodMutasi) {
      matchesMethod = (t.metode_pembayaran || 'Cash') === filterPaymentMethodMutasi;
    }

    let matchesSearch = true;
    if (searchMutasi) {
      const q = searchMutasi.toLowerCase();
      matchesSearch = (t.keterangan || '').toLowerCase().includes(q) || (t.kategori || '').toLowerCase().includes(q);
    }

    return matchesMonth && matchesCategory && matchesMethod && matchesSearch;
  }).sort((a, b) => {
    const isAPinned = pinnedTxIds.includes(a.id);
    const isBPinned = pinnedTxIds.includes(b.id);
    if (isAPinned && !isBPinned) return -1;
    if (!isAPinned && isBPinned) return 1;

    if (sortMutasiOrder === 'date-asc') return new Date(a.tanggal) - new Date(b.tanggal);
    if (sortMutasiOrder === 'amount-desc') return b.nominal_yuan - a.nominal_yuan;
    if (sortMutasiOrder === 'amount-asc') return a.nominal_yuan - b.nominal_yuan;
    return new Date(b.tanggal) - new Date(a.tanggal);
  });

  const totalPaymentYuan = payments.reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const paidPaymentYuan = payments.filter(p => p.sudah_dibayar).reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const unpaidPaymentYuan = totalPaymentYuan - paidPaymentYuan;
  const paymentProgressPct = totalPaymentYuan > 0 ? Math.round((paidPaymentYuan / totalPaymentYuan) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(ev => !ev.judul.startsWith('[Tugas]'))
    .map(ev => {
      const endDateStr = ev.tanggal_selesai || ev.tanggal;
      const endTimeStr = ev.seharian ? '23:59:59' : (ev.jam_selesai || ev.jam || '23:59:59');
      const eventEndDateTime = new Date(`${endDateStr}T${endTimeStr}`);
      const startTimeStr = ev.seharian ? '00:00:00' : (ev.jam || '00:00:00');
      const eventStartDateTime = new Date(`${ev.tanggal}T${startTimeStr}`);
      const diffMs = eventStartDateTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return { ...ev, eventEndDateTime, eventStartDateTime, diffHours, diffDays };
    })
    .filter(ev => ev.eventEndDateTime > now)
    .sort((a, b) => a.eventStartDateTime - b.eventStartDateTime);

  const urgentTodos = todos.filter(t => {
    if (t.selesai) return false;
    const diff = new Date(t.tenggat_waktu) - new Date();
    return diff >= 0 && diff <= (24 * 60 * 60 * 1000);
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const getLast6Months = () => {
    const months = [];
    const n = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(n.getFullYear(), n.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[d.getMonth()];
      months.push({ key: monthKey, label: monthName });
    }
    return months;
  };

  const last6Months = getLast6Months();

  const incomeDataByMonth = last6Months.map(m => {
    return transactions
      .filter(t => t.tanggal.startsWith(m.key) && t.tipe === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.nominal_yuan), 0);
  });

  const expenseDataByMonth = last6Months.map(m => {
    return transactions
      .filter(t => t.tanggal.startsWith(m.key) && t.tipe === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.nominal_yuan), 0);
  });

  const chartData = {
    labels: last6Months.map(m => m.label),
    datasets: [
      { label: 'Pemasukan (¥)', data: incomeDataByMonth, borderColor: '#10b981', backgroundColor: '#10b981', tension: 0.3 },
      { label: 'Pengeluaran (¥)', data: expenseDataByMonth, borderColor: '#f43f5e', backgroundColor: '#f43f5e', tension: 0.3 },
    ],
  };

  const categoryTotalsArr = expenseCategories.map(cat => {
    return currentMonthTransactions
      .filter(t => t.tipe === 'pengeluaran' && t.kategori === cat)
      .reduce((sum, t) => sum + Number(t.nominal_yuan || 0), 0);
  });

  const totalCurrentExpense = categoryTotalsArr.reduce((a, b) => a + b, 0);

  const doughnutData = {
    labels: totalCurrentExpense === 0 ? ['Belum Ada Pengeluaran'] : expenseCategories,
    datasets: [
      {
        data: totalCurrentExpense === 0 ? [1] : categoryTotalsArr,
        backgroundColor: totalCurrentExpense === 0 
          ? ['#cbd5e1'] 
          : ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#a855f7', '#14b8a6'],
        borderWidth: 2,
        borderColor: darkMode ? '#0f172a' : '#ffffff',
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { size: isFullscreen ? 8 : 10 },
          color: darkMode ? '#cbd5e1' : '#334155'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (totalCurrentExpense === 0) return ' Belum ada pengeluaran';
            const value = context.raw || 0;
            return ` ¥ ${value.toLocaleString('id-ID')} (${formatIDR(value)})`;
          }
        }
      }
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 10, font: { size: isFullscreen ? 8 : 10 } } },
    },
    scales: {
      y: { ticks: { font: { size: isFullscreen ? 8 : 10 } } },
      x: { ticks: { font: { size: isFullscreen ? 8 : 10 } } }
    }
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getEventsForDate = (dateStr) => {
    const filteredAgenda = events
      .filter(ev => !ev.judul.startsWith('[Tugas]'))
      .filter((ev) => {
        const startDate = ev.tanggal;
        const endDate = ev.tanggal_selesai || ev.tanggal;
        return dateStr >= startDate && dateStr <= endDate;
      })
      .map(ev => ({ ...ev, isTodo: false }));

    const filteredTodos = todos
      .filter(t => !t.selesai && t.tenggat_waktu === dateStr)
      .map(t => ({
        id: `todo-${t.id}`,
        judul: `[Tugas] ${t.judul}`,
        tanggal: t.tenggat_waktu,
        seharian: true,
        isTodo: true
      }));

    return [...filteredAgenda, ...filteredTodos];
  };

  const handleDateClick = (dateStr) => {
    const dayEvents = getEventsForDate(dateStr);
    setSelectedDateEvents({ date: dateStr, list: dayEvents });
  };

  const budgetPercentage = Math.min(Math.round((monthExpenseYuan / (monthlyBudgetLimit || 1)) * 100), 100);

  const calculateGPA = () => {
    const totalSKS = gpaCourses.reduce((sum, c) => sum + Number(c.sks), 0);
    const totalPoints = gpaCourses.reduce((sum, c) => sum + (Number(c.gpa) * Number(c.sks)), 0);
    return totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : '0.00';
  };

  const renderCalendar = () => (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border ${isFullscreen ? 'p-3 h-full flex flex-col justify-between' : 'p-4 space-y-3'}`}>
      <div className="flex justify-between items-center">
        <h2 className={`${isFullscreen ? 'text-[11px]' : 'text-xs'} font-bold flex items-center gap-1`}>
          <span>📅</span> Kalender Agenda & Tugas
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-[10px] font-bold px-2 text-slate-700 dark:text-slate-200"
          >
            &lt;
          </button>
          <span className="text-[10px] font-semibold min-w-[70px] text-center">
            {currentMonth.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-[10px] font-bold px-2 text-slate-700 dark:text-slate-200"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-bold text-slate-400">
        <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isFullscreen ? 'flex-1 grid-rows-5' : ''}`}>
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-900/50 rounded-lg"></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = getEventsForDate(dateStr);

          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(dateStr)}
              className={`p-1 border rounded-lg flex flex-col justify-between cursor-pointer transition overflow-hidden group ${
                darkMode ? 'bg-slate-900/40 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 hover:bg-blue-50 border-slate-100'
              } ${isFullscreen ? 'h-full' : 'h-11'}`}
            >
              <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-500">{day}</span>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => (
                  <div 
                    key={ev.id} 
                    className={`text-[7px] px-0.5 py-0 rounded truncate font-medium border ${
                      ev.isTodo || ev.judul.startsWith('[Tugas]')
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {ev.judul}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
      ref={fullscreenRef} 
      className={`min-h-screen font-sans transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      } ${isFullscreen ? 'h-screen overflow-hidden p-3 flex flex-col justify-between' : 'pb-20'}`}
    >
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-3 right-3 z-50 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-bounce"
        >
          <Minimize className="w-3.5 h-3.5" />
          <span>Keluar Fullscreen (ESC)</span>
        </button>
      )}

      <div className={`${isFullscreen ? 'h-full flex flex-col justify-between gap-2 max-w-full' : 'max-w-4xl mx-auto p-4 space-y-5'}`}>
        
        {/* HEADER APLIKASI */}
        <header className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl shadow-sm border flex justify-between items-center gap-3`}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Student Manager Pro</h1>
              <span className="bg-amber-500/20 text-amber-500 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" /> Streak {streakCount} Hari
              </span>
            </div>
            <p className="text-xs text-slate-400">Keuangan, Kuliah, Pembayaran & Smart Tools</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className={`p-2 rounded-xl border transition text-xs font-bold ${hideBalance ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
              title="Sembunyikan Saldo"
            >
              {hideBalance ? '🙈 Private' : '👁️ Public'}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className={`p-1.5 rounded-xl text-right border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[10px] text-slate-400">1 RMB =</span>
                {editingKurs ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempKurs}
                      onChange={(e) => setTempKurs(e.target.value)}
                      className="w-16 bg-white dark:bg-slate-900 border text-xs rounded px-1 dark:text-white"
                    />
                    <button onClick={updateKurs} className="text-[10px] bg-emerald-600 px-1.5 py-0.5 text-white font-bold rounded">OK</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingKurs(true)} className="flex items-center gap-1 font-bold text-blue-500 text-xs">
                    <span>Rp {kursRate.toLocaleString('id-ID')}</span>
                    <Edit2 className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition items-center gap-1.5"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span>{isFullscreen ? 'Keluar' : 'Mode Fullscreen'}</span>
            </button>
          </div>
        </header>

        {urgentTodos.length > 0 && !isFullscreen && (
          <div className="bg-amber-500 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Peringatan Deadline Urgent (&lt;24 Jam): Ada {urgentTodos.length} tugas yang hampir jatuh tempo!</span>
            </div>
            <button onClick={() => setActiveTab('todo')} className="bg-white text-amber-900 px-2 py-1 rounded-lg text-[10px] uppercase font-black">
              Cek Tugas
            </button>
          </div>
        )}

        {/* TAB NAVIGATION */}
        {!isFullscreen && (
          <nav className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Utama', icon: LayoutDashboard },
              { id: 'todo', label: 'To Do Tugas', icon: CheckSquare },
              { id: 'keuangan', label: 'Keuangan', icon: Wallet },
              { id: 'kuliah', label: 'Kuliah', icon: CalendarIcon },
              { id: 'pembayaran', label: 'Pembayaran', icon: GraduationCap },
              { id: 'tools', label: 'Fitur Tambahan (20 In 1)', icon: Calculator }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : darkMode ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* MAIN DASHBOARD */}
        {(activeTab === 'dashboard' || isFullscreen) && (
          <div className={`${isFullscreen ? 'flex-1 flex flex-col justify-between gap-2 overflow-hidden' : 'space-y-4'}`}>
            
            {monthExpenseYuan > monthlyBudgetLimit && (
              <div className="bg-rose-500 text-white p-3 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md animate-pulse">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>Peringatan: Pengeluaran bulan ini ({formatYuan(monthExpenseYuan)}) telah melebihi batas anggaran ({formatYuan(monthlyBudgetLimit)})!</span>
              </div>
            )}

            {todayExpenseYuan > dailyBudgetLimit && (
              <div className="bg-orange-500 text-white p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Pengeluaran Hari Ini ({formatYuan(todayExpenseYuan)}) Melebihi Batas Harian ({formatYuan(dailyBudgetLimit)})!</span>
              </div>
            )}

            {!isFullscreen && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-3.5 rounded-2xl border shadow-sm md:col-span-2 space-y-2`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-500" />
                      Status Anggaran Bulanan
                    </span>
                    <div className="flex items-center gap-2">
                      {editingBudget ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={tempBudget} 
                            onChange={(e) => setTempBudget(Number(e.target.value))}
                            className="w-20 border rounded px-1 py-0.5 text-xs text-black"
                          />
                          <button 
                            onClick={() => { setMonthlyBudgetLimit(tempBudget); setEditingBudget(false); }}
                            className="bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] rounded font-bold"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setTempBudget(monthlyBudgetLimit); setEditingBudget(true); }}
                          className="font-semibold text-slate-400 hover:text-blue-500 flex items-center gap-1"
                        >
                          {formatYuan(monthExpenseYuan)} / {formatYuan(monthlyBudgetLimit)} ({budgetPercentage}%)
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        budgetPercentage > 90 ? 'bg-rose-500' : budgetPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between`}>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rata-Rata Harian (Bulan Ini)</span>
                  <div>
                    <span className="font-extrabold text-sm block text-blue-500">{formatYuan(dailyAverageExpense)}</span>
                    <span className="text-[9px] text-slate-400">{formatIDR(dailyAverageExpense)} / hari</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl border border-indigo-700 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-semibold block uppercase">Pengeluaran Terbesar</span>
                    <span className="font-extrabold text-sm text-indigo-100">{topExpense.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-400 text-sm block">{formatYuan(topExpense.amount)}</span>
                    <span className="text-[9px] text-indigo-300">{formatIDR(topExpense.amount)}</span>
                  </div>
                </div>
              </div>
            )}

            {!isFullscreen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xs flex items-center gap-1.5">
                      <PieChart className="w-4 h-4 text-purple-500" />
                      <span>Proporsi Pengeluaran per Kategori Bulan Ini</span>
                    </h2>
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                      {selectedMonth}
                    </span>
                  </div>
                  <div className="h-56 relative flex items-center justify-center">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-2`}>
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Grafik Keuangan Bulanan</span>
                    </h2>
                    <span className="text-[10px] text-slate-400 font-medium">Yuan (¥)</span>
                  </div>
                  <div className="h-56 flex items-center justify-center">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {isFullscreen ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-700 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">WAKTU REALTIME</span>
                    <p className="text-5xl md:text-6xl font-mono font-black text-amber-300 tracking-tight my-1">
                      {cstTimeString || '00:00:00'} <span className="text-xl text-amber-400 font-bold">+CST</span>
                    </p>
                    <p className="text-sm md:text-base text-slate-200 font-semibold">
                      {cstDateString}
                    </p>
                  </div>

                  <div className="md:col-span-2 bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs md:text-sm font-bold text-slate-300">Rekapitulasi Keuangan</span>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1"
                      />
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                      <div className="bg-slate-800/60 p-2 rounded-xl border border-cyan-500/30">
                        <p className="text-[10px] text-cyan-400 font-bold">Sisa Saldo Total</p>
                        <p className="text-xs md:text-sm font-extrabold text-cyan-300 mt-0.5">{formatYuan(totalRemainingBalanceYuan)}</p>
                        <p className="text-[8px] text-slate-400">{formatIDR(totalRemainingBalanceYuan)}</p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded-xl border border-emerald-500/30">
                        <p className="text-[10px] text-emerald-400 font-bold">💵 Saldo Cash</p>
                        <p className="text-xs md:text-sm font-extrabold text-emerald-300 mt-0.5">{formatYuan(totalCashBalanceYuan)}</p>
                        <p className="text-[8px] text-slate-400">{formatIDR(totalCashBalanceYuan)}</p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded-xl border border-blue-500/30">
                        <p className="text-[10px] text-blue-400 font-bold">💳 Saldo Bank</p>
                        <p className="text-xs md:text-sm font-extrabold text-blue-300 mt-0.5">{formatYuan(totalBankBalanceYuan)}</p>
                        <p className="text-[8px] text-slate-400">{formatIDR(totalBankBalanceYuan)}</p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                        <p className="text-[10px] text-emerald-400 font-bold">Pemasukan ({selectedMonth})</p>
                        <p className="text-xs md:text-sm font-extrabold text-emerald-300 mt-0.5">{formatYuan(monthIncomeYuan)}</p>
                        <p className="text-[8px] text-slate-400">{formatIDR(monthIncomeYuan)}</p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                        <p className="text-[10px] text-rose-400 font-bold">Pengeluaran Total</p>
                        <p className="text-xs md:text-sm font-extrabold text-rose-300 mt-0.5">{formatYuan(monthExpenseYuan)}</p>
                        <p className="text-[8px] text-slate-400">{formatIDR(monthExpenseYuan)}</p>
                      </div>

                      <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                        <p className="text-[10px] text-amber-400 font-bold">Non-Biaya Kuliah</p>
                        <p className="text-xs md:text-sm font-extrabold text-amber-300 mt-0.5">{formatYuan(monthNonCollegeExpenseYuan)}</p>
                        <p className="text-[8px] text-slate-400">{formatIDR(monthNonCollegeExpenseYuan)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="font-bold text-xs flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-amber-600" />
                        <span>Daftar Tugas Mendatang</span>
                      </h2>
                    </div>
                    <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                      {todos.filter(t => !t.selesai).slice(0, 5).map(item => {
                        const priority = getAutoPriority(item.tenggat_waktu);
                        return (
                          <div key={item.id} className={`p-2 border rounded-xl flex justify-between items-center ${priority.blockBg}`}>
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleTodoStatus(item.id, item.selesai)}>
                                <Square className="w-4 h-4 text-slate-300 hover:text-emerald-600" />
                              </button>
                              <div>
                                <p className="font-bold text-xs text-slate-800 line-clamp-1">{item.judul}</p>
                                <p className="text-[9px] text-slate-500">Tenggat: {item.tenggat_waktu}</p>
                              </div>
                            </div>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded ${priority.badgeColor}`}>{priority.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="font-bold text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Agenda Kuliah Terdekat</span>
                      </h2>
                    </div>
                    <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                      {upcomingEvents.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">Belum ada agenda terdekat.</p>
                      ) : (
                        upcomingEvents.slice(0, 5).map(ev => {
                          const isWithin24Hours = ev.diffHours >= 0 && ev.diffHours <= 24;
                          return (
                            <div key={ev.id} className={`p-2 rounded-xl border flex justify-between items-center ${isWithin24Hours ? 'bg-amber-100/70 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <p className="font-bold text-xs line-clamp-1">{ev.judul}</p>
                                  {isWithin24Hours && <span className="text-[8px] bg-amber-500 text-white font-bold px-1 py-0.2 rounded">&lt; 24j</span>}
                                </div>
                                <p className="text-[9px] text-slate-500">
                                  {ev.tanggal} • {ev.seharian ? 'Seharian (24 Jam)' : `${ev.jam || '-'} - ${ev.jam_selesai || '-'}`}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="font-bold text-xs">Proporsi Pengeluaran per Kategori</h2>
                      <span className="text-[10px] text-slate-400 font-medium">Yuan (¥)</span>
                    </div>
                    <div className="flex-1 min-h-[120px] flex items-center justify-center relative">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                  </div>
                  {renderCalendar()}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-700 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1">WAKTU REALTIME</span>
                  <p className="text-3xl md:text-4xl font-mono font-black text-amber-300 tracking-tight my-1">
                    {cstTimeString || '00:00:00'} <span className="text-lg text-amber-400 font-bold">+CST</span>
                  </p>
                  <p className="text-xs md:text-sm text-slate-200 font-semibold">
                    {cstDateString}
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs md:text-sm font-bold text-slate-300">Rekapitulasi Keuangan</span>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-cyan-500/30">
                      <p className="text-xs text-cyan-400 font-bold">Total Sisa Saldo</p>
                      <p className={`text-sm md:text-base font-extrabold mt-0.5 ${totalRemainingBalanceYuan >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                        {formatYuan(totalRemainingBalanceYuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(totalRemainingBalanceYuan)}</p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-emerald-500/30">
                      <p className="text-xs text-emerald-400 font-bold">💵 Sisa Saldo Cash</p>
                      <p className={`text-sm md:text-base font-extrabold mt-0.5 ${totalCashBalanceYuan >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                        {formatYuan(totalCashBalanceYuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(totalCashBalanceYuan)}</p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-blue-500/30">
                      <p className="text-xs text-blue-400 font-bold">💳 Sisa Saldo Bank</p>
                      <p className={`text-sm md:text-base font-extrabold mt-0.5 ${totalBankBalanceYuan >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
                        {formatYuan(totalBankBalanceYuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(totalBankBalanceYuan)}</p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <p className="text-xs text-emerald-400 font-bold">Pemasukan ({selectedMonth})</p>
                      <p className="text-sm md:text-base font-extrabold text-emerald-300 mt-0.5">{formatYuan(monthIncomeYuan)}</p>
                      <p className="text-[9px] text-slate-400">{formatIDR(monthIncomeYuan)}</p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <p className="text-xs text-rose-400 font-bold">Pengeluaran Total</p>
                      <p className="text-sm md:text-base font-extrabold text-rose-300 mt-0.5">{formatYuan(monthExpenseYuan)}</p>
                      <p className="text-[9px] text-slate-400">{formatIDR(monthExpenseYuan)}</p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <p className="text-xs text-amber-400 font-bold">Non-Biaya Kuliah</p>
                      <p className="text-sm md:text-base font-extrabold text-amber-300 mt-0.5">{formatYuan(monthNonCollegeExpenseYuan)}</p>
                      <p className="text-[9px] text-slate-400">{formatIDR(monthNonCollegeExpenseYuan)}</p>
                    </div>
                  </div>
                </div>

                {renderCalendar()}
              </div>
            )}
          </div>
        )}

        {/* TAB TO DO LIST TUGAS */}
        {activeTab === 'todo' && !isFullscreen && (
          <div className="space-y-4">
            <form onSubmit={addTodo} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Tambah Tugas Baru</span>
              </h3>

              <input
                type="text"
                placeholder="Nama Tugas/Praktikum..."
                value={todoForm.judul}
                onChange={(e) => setTodoForm({ ...todoForm, judul: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tenggat Waktu</label>
                <input
                  type="date"
                  value={todoForm.tenggat_waktu}
                  onChange={(e) => setTodoForm({ ...todoForm, tenggat_waktu: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                + Tambah Tugas
              </button>
            </form>

            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <h2 className="font-bold text-xs">Daftar Tugas & PR</h2>
                <div className="flex items-center gap-1 text-[10px]">
                  <button onClick={exportTodosToCSV} className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1 mr-2">
                    <Download className="w-3 h-3" /> Export
                  </button>
                  <button onClick={markAllTodosDone} className="p-1.5 bg-blue-100 text-blue-800 rounded-lg font-bold flex items-center gap-1 mr-2">
                    <CheckCircle2 className="w-3 h-3" /> Semua Selesai
                  </button>
                  {['all', 'high', 'medium', 'low'].map(p => (
                    <button
                      key={p}
                      onClick={() => setTodoFilterPriority(p)}
                      className={`px-2 py-0.5 rounded-md font-bold uppercase transition ${
                        todoFilterPriority === p 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {p === 'all' ? 'Semua' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari tugas..."
                  value={searchTodo}
                  onChange={(e) => setSearchTodo(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                {todos
                  .filter(item => {
                    const matchesSearch = item.judul.toLowerCase().includes(searchTodo.toLowerCase());
                    if (todoFilterPriority === 'all') return matchesSearch;
                    const p = getAutoPriority(item.tenggat_waktu);
                    return p.code === todoFilterPriority && matchesSearch;
                  })
                  .map((item) => {
                    const isOverdue = new Date(item.tenggat_waktu) < today && !item.selesai;
                    const priority = getAutoPriority(item.tenggat_waktu);

                    return (
                      <div key={item.id} className={`p-3 border rounded-xl flex justify-between items-center ${item.selesai ? 'bg-slate-50 dark:bg-slate-800/40 opacity-60' : priority.blockBg}`}>
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => toggleTodoStatus(item.id, item.selesai)}>
                            {item.selesai ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${item.selesai ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {item.judul}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[8px] px-1.5 py-0.2 rounded ${priority.badgeColor}`}>
                                Prioritas {priority.label}
                              </span>
                              <span className={`text-[9.5px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                Tenggat: {item.tenggat_waktu}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button onClick={() => deleteTodo(item.id)} className="p-1 text-slate-300 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB KEUANGAN */}
        {activeTab === 'keuangan' && !isFullscreen && (
          <div className="space-y-4">
            
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-3 rounded-2xl border shadow-sm space-y-1.5`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">⚡ Quick Expense Presets (1-Klik)</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { label: '🍚 Makan ¥15', cat: 'Makan', amount: 15, ket: 'Makan Siang/Malam' },
                  { label: '🧋 Minum ¥8', cat: 'Minum', amount: 8, ket: 'Beli Minuman/Kopi' },
                  { label: '🍿 Jajan ¥10', cat: 'Jajan', amount: 10, ket: 'Cemilan' },
                  { label: '🚌 Bus ¥2', cat: 'Transportasi', amount: 2, ket: 'Naik Bus/Metro' },
                  { label: '📲 Kuota ¥50', cat: 'Kuota', amount: 50, ket: 'Isi Paket Data' },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPreset(p.cat, p.amount, p.ket)}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 dark:border-slate-700 whitespace-nowrap transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300">Ringkasan Sisa Saldo Real-Time</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-lg font-semibold">Live Real-time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-cyan-500/30">
                  <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Total Sisa Saldo (Keseluruhan)</p>
                  <p className={`text-base font-extrabold mt-1 ${totalRemainingBalanceYuan >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                    {formatYuan(totalRemainingBalanceYuan)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatIDR(totalRemainingBalanceYuan)}</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Bulanan ({selectedMonth})</p>
                  <p className={`text-base font-extrabold mt-1 ${monthBalanceYuan >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {formatYuan(monthBalanceYuan)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatIDR(monthBalanceYuan)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center pt-1">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Sisa Saldo Cash</span>
                    </div>
                    <p className={`text-sm md:text-base font-extrabold mt-1 ${totalCashBalanceYuan >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                      {formatYuan(totalCashBalanceYuan)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatIDR(totalCashBalanceYuan)}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 border-t border-slate-700/60 mt-2 pt-1">
                    Bulan Ini: <span className={monthCashBalanceYuan >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{formatYuan(monthCashBalanceYuan)}</span>
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-blue-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-blue-400 uppercase font-bold tracking-wider">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Sisa Saldo Bank</span>
                    </div>
                    <p className={`text-sm md:text-base font-extrabold mt-1 ${totalBankBalanceYuan >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
                      {formatYuan(totalBankBalanceYuan)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatIDR(totalBankBalanceYuan)}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 border-t border-slate-700/60 mt-2 pt-1">
                    Bulan Ini: <span className={monthBankBalanceYuan >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{formatYuan(monthBankBalanceYuan)}</span>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={addTransaction} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h2 className="font-bold text-xs">Catat Transaksi Baru</h2>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pengeluaran' })}
                  className={`py-2 rounded-xl text-xs font-bold border ${financeForm.tipe === 'pengeluaran' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pemasukan' })}
                  className={`py-2 rounded-xl text-xs font-bold border ${financeForm.tipe === 'pemasukan' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  Pemasukan
                </button>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFinanceForm({ ...financeForm, metode_pembayaran: 'Cash' })}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                      financeForm.metode_pembayaran === 'Cash' 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinanceForm({ ...financeForm, metode_pembayaran: 'Bank' })}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                      financeForm.metode_pembayaran === 'Bank' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    💳 Bank
                  </button>
                </div>
              </div>

              {financeForm.tipe === 'pengeluaran' && (
                <div className="flex gap-2">
                  <select
                    value={financeForm.kategori}
                    onChange={(e) => setFinanceForm({ ...financeForm, kategori: e.target.value })}
                    className="flex-1 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                  >
                    {expenseCategories.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    + Baru
                  </button>
                </div>
              )}

              <input
                type="number"
                step="any"
                placeholder="Nominal (¥ Yuan)"
                value={financeForm.nominalYuan}
                onChange={(e) => setFinanceForm({ ...financeForm, nominalYuan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />

              <input
                type="date"
                value={financeForm.tanggal}
                onChange={(e) => setFinanceForm({ ...financeForm, tanggal: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
              />

              <input
                type="text"
                placeholder="Keterangan..."
                value={financeForm.keterangan}
                onChange={(e) => setFinanceForm({ ...financeForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
              />

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                Simpan Transaksi
              </button>
            </form>

            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <div className="flex justify-between items-center relative">
                <div>
                  <h2 className="font-bold text-xs flex items-center gap-1.5">
                    Riwayat Mutasi <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">{filteredMutasiTransactions.length} Total</span>
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {filterMonthMutasi 
                      ? `Menampilkan bulan: ${filterMonthMutasi}` 
                      : 'Menampilkan: 1 Minggu Terakhir (Default)'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={exportTransactionsToCSV}
                    className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor</span>
                  </button>

                  {(filterMonthMutasi || filterCategoryMutasi || filterPaymentMethodMutasi || searchMutasi) && (
                    <button 
                      onClick={() => {
                        setFilterMonthMutasi('');
                        setFilterCategoryMutasi('');
                        setFilterPaymentMethodMutasi('');
                        setSearchMutasi('');
                      }}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 text-[10px] flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setShowFilterSort(!showFilterSort)}
                    className={`p-1.5 rounded-xl border transition ${
                      showFilterSort || filterMonthMutasi || filterCategoryMutasi || filterPaymentMethodMutasi || searchMutasi
                        ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-300 text-blue-600' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi / keterangan..."
                  value={searchMutasi}
                  onChange={(e) => setSearchMutasi(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {showFilterSort && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px]">Filter & Sorting Lanjutan:</span>
                    <button onClick={() => setShowFilterSort(false)} className="text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Bulan</label>
                      <input
                        type="month"
                        value={filterMonthMutasi}
                        onChange={(e) => setFilterMonthMutasi(e.target.value)}
                        className="w-full border p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Kategori</label>
                      <select
                        value={filterCategoryMutasi}
                        onChange={(e) => setFilterCategoryMutasi(e.target.value)}
                        className="w-full border p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="">Semua Kategori</option>
                        <option value="Pemasukan">Pemasukan</option>
                        {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Metode</label>
                      <select
                        value={filterPaymentMethodMutasi}
                        onChange={(e) => setFilterPaymentMethodMutasi(e.target.value)}
                        className="w-full border p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="">Semua Metode</option>
                        <option value="Cash">💵 Cash</option>
                        <option value="Bank">💳 Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Urutan</label>
                      <select
                        value={sortMutasiOrder}
                        onChange={(e) => setSortMutasiOrder(e.target.value)}
                        className="w-full border p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 dark:border-slate-700"
                      >
                        <option value="date-desc">Terbaru</option>
                        <option value="date-asc">Terlama</option>
                        <option value="amount-desc">Nominal Terbesar</option>
                        <option value="amount-asc">Nominal Terkecil</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMutasiTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Tidak ada riwayat transaksi pada periode ini.</p>
                ) : (
                  filteredMutasiTransactions.map(t => {
                    const isPinned = pinnedTxIds.includes(t.id);
                    return (
                      <div key={t.id} className={`py-2.5 flex justify-between items-center text-xs ${isPinned ? 'bg-amber-50/50 dark:bg-amber-950/20 px-2 rounded-lg' : ''}`}>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => togglePinTx(t.id)}>
                              <Pin className={`w-3 h-3 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                            </button>
                            <p className="font-bold">{t.keterangan || t.kategori}</p>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-semibold ${
                              t.metode_pembayaran === 'Bank' 
                                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' 
                                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {t.metode_pembayaran === 'Bank' ? '💳 Bank' : '💵 Cash'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{t.tanggal} • {t.kategori}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                            </p>
                            <p className="text-[10px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                          </div>

                          <button onClick={() => setEditingTransaction(t)} className="p-1 text-slate-400 hover:text-blue-500">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button onClick={() => deleteTransaction(t.id)} className="p-1 text-slate-300 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB KULIAH */}
        {activeTab === 'kuliah' && !isFullscreen && (
          <div className="space-y-4">
            {renderCalendar()}

            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-3 rounded-2xl border shadow-sm`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari jadwal / agenda kuliah..."
                  value={searchAgenda}
                  onChange={(e) => setSearchAgenda(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
              </div>
              {searchAgenda && (
                <div className="mt-2 space-y-1">
                  {events.filter(e => e.judul.toLowerCase().includes(searchAgenda.toLowerCase())).map(ev => (
                    <div key={ev.id} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between">
                      <span className="font-bold">{ev.judul}</span>
                      <span className="text-slate-400">{ev.tanggal} ({ev.jam})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={addAgenda} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-5 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Tambah Agenda Baru</span>
              </h3>

              <input
                type="text"
                placeholder="Judul agenda/tugas"
                value={agendaForm.judul}
                onChange={(e) => setAgendaForm({ ...agendaForm, judul: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={agendaForm.tanggal}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      setAgendaForm(prev => ({
                        ...prev,
                        tanggal: startDate,
                        tanggal_selesai: prev.tanggal_selesai < startDate ? startDate : prev.tanggal_selesai
                      }));
                    }}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    min={agendaForm.tanggal}
                    value={agendaForm.tanggal_selesai}
                    onChange={(e) => setAgendaForm({ ...agendaForm, tanggal_selesai: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="seharian"
                  checked={agendaForm.seharian}
                  onChange={(e) => setAgendaForm({ ...agendaForm, seharian: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="seharian" className="text-xs font-semibold cursor-pointer select-none">
                  Seharian (24 Jam)
                </label>
              </div>

              {!agendaForm.seharian && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Jam Mulai</label>
                    <input
                      type="time"
                      value={agendaForm.jam}
                      onChange={(e) => setAgendaForm({ ...agendaForm, jam: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Jam Selesai</label>
                    <input
                      type="time"
                      value={agendaForm.jam_selesai}
                      onChange={(e) => setAgendaForm({ ...agendaForm, jam_selesai: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Keterangan tambahan (opsional)"
                value={agendaForm.keterangan}
                onChange={(e) => setAgendaForm({ ...agendaForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
              />

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                + Simpan Agenda
              </button>
            </form>
          </div>
        )}

        {/* TAB PEMBAYARAN KULIAH */}
        {activeTab === 'pembayaran' && !isFullscreen && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg space-y-3">
              <span className="text-xs text-slate-400">Total Ringkasan Pembayaran Kuliah</span>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                  <span>Progres Kelunasan Tagihan</span>
                  <span>{paymentProgressPct}% Lunas</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${paymentProgressPct}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-xs text-emerald-400">Lunas</p>
                  <p className="text-sm font-bold text-emerald-300">{formatYuan(paidPaymentYuan)}</p>
                  <p className="text-[10px] text-slate-400">{formatIDR(paidPaymentYuan)}</p>
                </div>
                <div>
                  <p className="text-xs text-rose-400">Belum Lunas</p>
                  <p className="text-sm font-bold text-rose-300">{formatYuan(unpaidPaymentYuan)}</p>
                  <p className="text-[10px] text-slate-400">{formatIDR(unpaidPaymentYuan)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {['Tahun Bahasa', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4'].map(thn => (
                <button
                  key={thn}
                  onClick={() => setSelectedPaymentYear(thn)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border ${selectedPaymentYear === thn ? 'bg-blue-600 text-white border-blue-600' : darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {thn}
                </button>
              ))}
            </div>

            <form onSubmit={addPayment} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                <span>Tambah Tagihan ({selectedPaymentYear})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Tagihan (ex: Asuransi / MCU)"
                  value={newPaymentForm.nama_tagihan}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, nama_tagihan: e.target.value })}
                  className="border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Nominal (¥ Yuan)"
                  value={newPaymentForm.jumlah_yuan}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, jumlah_yuan: e.target.value })}
                  className="border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newPaymentForm.tenggat_waktu}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, tenggat_waktu: e.target.value })}
                  className="flex-1 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs">
                  + Simpan Tagihan
                </button>
              </div>
            </form>

            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-2`}>
              <h3 className="font-bold text-xs">Tagihan {selectedPaymentYear}</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.filter(p => p.kategori_tahun === selectedPaymentYear).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada tagihan di kategori ini.</p>
                ) : (
                  payments.filter(p => p.kategori_tahun === selectedPaymentYear).map(p => (
                    <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePaymentStatus(p.id, p.sudah_dibayar)}>
                          {p.sudah_dibayar ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-slate-300" />}
                        </button>
                        <div>
                          <p className={`font-bold ${p.sudah_dibayar ? 'line-through text-slate-400' : ''}`}>{p.nama_tagihan}</p>
                          <p className="text-[10px] text-slate-400">Tenggat: {p.tenggat_waktu || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{formatYuan(p.jumlah_yuan)}</p>
                          <p className="text-[9px] text-slate-400">{formatIDR(p.jumlah_yuan)}</p>
                        </div>
                        <button onClick={() => setEditingPayment(p)} className="p-1 text-slate-400 hover:text-blue-500">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deletePayment(p.id)} className="p-1 text-slate-300 hover:text-rose-500">
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

        {/* TAB FITUR TAMBAHAN (20 IN 1) */}
        {activeTab === 'tools' && !isFullscreen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Timer Pomodoro */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Timer Fokus Pomodoro ({pomoMode === 'work' ? 'Belajar' : 'Istirahat'})</span>
              </h3>
              <div className="text-center py-2">
                <span className="text-4xl font-mono font-black text-rose-500">
                  {Math.floor(pomoTime / 60).toString().padStart(2, '0')}:{(pomoTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPomoActive(!pomoActive)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold text-white transition ${pomoActive ? 'bg-amber-500' : 'bg-emerald-600'}`}
                >
                  {pomoActive ? 'Jeda' : 'Mulai Fokus'}
                </button>
                <button
                  onClick={() => { setPomoActive(false); setPomoTime(25 * 60); setPomoMode('work'); }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 2. Tracker Air Minum */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span>Hidrasi Air Minum Harian</span>
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{waterGlasses} / 8 Gelas</span>
                <div className="flex gap-1">
                  <button onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs">-</button>
                  <button onClick={() => setWaterGlasses(prev => prev + 1)} className="px-2 py-1 bg-blue-600 text-white rounded font-bold text-xs">+ Minum</button>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}></div>
              </div>
            </div>

            {/* 3. Sticky Notes */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-2 md:col-span-2`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-amber-500" />
                <span>Catatan Cepat (Sticky Note)</span>
              </h3>
              <textarea
                value={stickyNote}
                onChange={(e) => setStickyNote(e.target.value)}
                placeholder="Tulis catatan ringkas di sini (otomatis tersimpan)..."
                rows={3}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-amber-50/50 dark:bg-slate-800 dark:text-white"
              ></textarea>
            </div>

            {/* 4. Target Tabungan / Savings Goals */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Target Impian Tabungan</span>
              </h3>
              <div className="space-y-2">
                {savingsGoals.map(goal => {
                  const pct = Math.min(100, Math.round((goal.currentYuan / goal.targetYuan) * 100));
                  return (
                    <div key={goal.id} className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{goal.name}</span>
                        <span className="text-emerald-500">{formatYuan(goal.currentYuan)} / {formatYuan(goal.targetYuan)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Kalkulator IPK / GPA Calculator */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Kalkulator Estimasi IPK</span>
                </h3>
                <span className="text-xs font-extrabold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-lg">IPK: {calculateGPA()}</span>
              </div>
              <div className="space-y-1 text-xs">
                {gpaCourses.map(c => (
                  <div key={c.id} className="flex justify-between border-b dark:border-slate-800 py-1">
                    <span>{c.name} ({c.sks} SKS)</span>
                    <span className="font-bold">Nilai: {c.gpa}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Wishlist Pembelian */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-500" />
                <span>Wishlist Impian Barang</span>
              </h3>
              <div className="space-y-2">
                {wishlist.map(w => (
                  <div key={w.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="font-medium">{w.title}</span>
                    <span className="font-bold text-blue-500">{formatYuan(w.priceYuan)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Backup & Restore Data */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Cadangan & Pemulihan Data (JSON)</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={exportFullBackupJSON} className="py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Ekspor JSON
                </button>
                <label className="py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Impor JSON
                  <input type="file" accept=".json" onChange={handleImportBackupJSON} className="hidden" />
                </label>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL TAMBAH KATEGORI BARU */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-white'} p-5 rounded-2xl max-w-sm w-full space-y-3 border border-slate-200 dark:border-slate-800 shadow-xl`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs">Tambah Kategori Baru</h3>
              <button onClick={() => setShowAddCategoryModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Kategori Pengeluaran..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold">
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT TRANSAKSI */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-white'} p-5 rounded-2xl max-w-sm w-full space-y-3 border border-slate-200 dark:border-slate-800 shadow-xl`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs">Edit Transaksi</h3>
              <button onClick={() => setEditingTransaction(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={updateTransaction} className="space-y-3">
              <input
                type="number"
                step="any"
                value={editingTransaction.nominal_yuan}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, nominal_yuan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />
              <input
                type="text"
                value={editingTransaction.keterangan || ''}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, keterangan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                placeholder="Keterangan..."
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold">
                Perbarui Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT TAGIHAN PEMBAYARAN */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-white'} p-5 rounded-2xl max-w-sm w-full space-y-3 border border-slate-200 dark:border-slate-800 shadow-xl`}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs">Edit Tagihan Kuliah</h3>
              <button onClick={() => setEditingPayment(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={updatePayment} className="space-y-3">
              <input
                type="text"
                value={editingPayment.nama_tagihan}
                onChange={(e) => setEditingPayment({ ...editingPayment, nama_tagihan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />
              <input
                type="number"
                step="any"
                value={editingPayment.jumlah_yuan}
                onChange={(e) => setEditingPayment({ ...editingPayment, jumlah_yuan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white"
                required
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
