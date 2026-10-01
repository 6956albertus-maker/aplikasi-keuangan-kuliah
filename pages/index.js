import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  Clock, Edit2, X, Trash2, Plus, CheckSquare, Square, ListTodo, 
  Maximize, Minimize, Filter, RefreshCw, CreditCard, Banknote,
  Search, Download, AlertTriangle, Target, Calculator, Moon, Sun,
  Pin, StickyNote, PieChart, CheckCircle2, Bookmark, Flame, Upload,
  DollarSign, Percent, FileText, Check, Award, ArrowUpRight, ArrowDownRight,
  Sparkles, ShieldCheck, Heart, MessageSquare, Play, Pause, RotateCcw,
  ExternalLink, PhoneCall, Droplets
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
  const [editingAgenda, setEditingAgenda] = useState(null);

  // States Pembayaran Kuliah
  const [payments, setPayments] = useState([]);
  const [selectedPaymentYear, setSelectedPaymentYear] = useState('Tahun Bahasa');
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

  // GPA Calculator States (FULL EDITABLE)
  const [gpaCourses, setGpaCourses] = useState([
    { id: 1, name: 'Bahasa Mandarin', gpa: 4.0, sks: 4 },
    { id: 2, name: 'Matematika Diskrit', gpa: 3.5, sks: 3 }
  ]);
  const [newCourse, setNewCourse] = useState({ name: '', gpa: 4.0, sks: 3 });
  const [editingCourse, setEditingCourse] = useState(null);
  const [targetGpaInput, setTargetGpaInput] = useState('3.80');

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
      gpaCourses,
      bookmarks,
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
          if (parsed.gpaCourses) setGpaCourses(parsed.gpaCourses);
          if (parsed.bookmarks) setBookmarks(parsed.bookmarks);
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
      const nextMode = pomoMode === 'work' ? 'break' : 'work';
      setPomoMode(nextMode);
      setPomoTime(nextMode === 'work' ? 25 * 60 : 5 * 60);
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

  async function updateAgenda(e) {
    e.preventDefault();
    if (!editingAgenda || !editingAgenda.judul.trim()) return;

    const payload = {
      judul: editingAgenda.judul,
      tanggal: editingAgenda.tanggal,
      tanggal_selesai: editingAgenda.tanggal_selesai || editingAgenda.tanggal,
      jam: editingAgenda.seharian ? '00:00' : (editingAgenda.jam || '09:00'),
      jam_selesai: editingAgenda.seharian ? '23:59' : (editingAgenda.jam_selesai || '10:00'),
      seharian: editingAgenda.seharian,
      keterangan: editingAgenda.keterangan
    };

    const { error } = await supabase.from('agenda_kuliah').update(payload).eq('id', editingAgenda.id);
    if (error) { alert('Gagal memperbarui agenda: ' + error.message); return; }

    setEditingAgenda(null);
    fetchEvents();
    alert('Agenda berhasil diperbarui!');
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

  async function deleteTodo(id) {
    if (!window.confirm('Hapus tugas ini dari To-Do list?')) return;
    await supabase.from('todo_tugas').delete().eq('id', id);
  }

  // GPA Calculator Functions
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name.trim()) return;
    setGpaCourses([...gpaCourses, {
      id: Date.now(),
      name: newCourse.name.trim(),
      gpa: Number(newCourse.gpa),
      sks: Number(newCourse.sks)
    }]);
    setNewCourse({ name: '', gpa: 4.0, sks: 3 });
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setGpaCourses(gpaCourses.map(c => c.id === editingCourse.id ? editingCourse : c));
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id) => {
    setGpaCourses(gpaCourses.filter(c => c.id !== id));
  };

  const calculateGPA = () => {
    const totalSKS = gpaCourses.reduce((sum, c) => sum + Number(c.sks), 0);
    const totalPoints = gpaCourses.reduce((sum, c) => sum + (Number(c.gpa) * Number(c.sks)), 0);
    return totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : '0.00';
  };

  const getAutoPriority = (dueDateStr) => {
    if (!dueDateStr) return { label: 'Rendah', code: 'low', badgeColor: 'bg-slate-100 text-slate-600', blockBg: 'bg-slate-50 border-slate-200' };
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const dueObj = new Date(dueDateStr);
    dueObj.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueObj - todayObj) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return { label: 'Tinggi', code: 'high', badgeColor: 'bg-rose-500 text-white font-bold', blockBg: 'bg-rose-50 border-rose-200' };
    if (diffDays <= 3) return { label: 'Sedang', code: 'medium', badgeColor: 'bg-amber-500 text-white font-semibold', blockBg: 'bg-amber-50 border-amber-200' };
    return { label: 'Rendah', code: 'low', badgeColor: 'bg-slate-200 text-slate-700', blockBg: 'bg-slate-50 border-slate-200' };
  };

  const formatYuan = (val) => hideBalance ? '¥ ***' : `¥ ${Number(val || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatIDR = (val) => hideBalance ? 'Rp ***' : `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  // Logika Keuangan
  const totalIncomeAllTime = transactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const totalExpenseAllTime = transactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const totalRemainingBalanceYuan = totalIncomeAllTime - totalExpenseAllTime;

  const currentMonthTransactions = transactions.filter(t => t.tanggal.startsWith(selectedMonth));
  const monthIncomeYuan = currentMonthTransactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthExpenseYuan = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);

  const budgetPercentage = Math.min(Math.round((monthExpenseYuan / (monthlyBudgetLimit || 1)) * 100), 100);

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

  const renderCalendar = () => (
    <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} rounded-2xl shadow-sm border ${isFullscreen ? 'p-3 h-full flex flex-col justify-between' : 'p-4 space-y-3'}`}>
      <div className="flex justify-between items-center">
        <h2 className={`${isFullscreen ? 'text-[11px]' : 'text-xs'} font-bold flex items-center gap-1`}>
          <span>📅</span> Kalender Agenda & Tugas
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold px-2 text-slate-700 dark:text-slate-200"
          >
            &lt;
          </button>
          <span className="text-[10px] font-semibold min-w-[70px] text-center">
            {currentMonth.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold px-2 text-slate-700 dark:text-slate-200"
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
                darkMode ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 hover:bg-blue-50 border-slate-200'
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
      {/* FULLSCREEN MINIMIZE BUTTON */}
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
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Student Manager Pro</h1>
              <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" /> Streak {streakCount} Hari
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keuangan, Kuliah, Pembayaran & Smart Tools</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className={`p-2 rounded-xl border transition text-xs font-bold ${hideBalance ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}
              title="Sembunyikan Saldo"
            >
              {hideBalance ? '🙈 Private' : '👁️ Public'}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className={`p-1.5 rounded-xl text-right border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">1 RMB =</span>
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
                  <button onClick={() => setEditingKurs(true)} className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-xs">
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

        {/* TAB NAVIGATION */}
        {!isFullscreen && (
          <nav className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Utama', icon: LayoutDashboard },
              { id: 'todo', label: 'To Do Tugas', icon: CheckSquare },
              { id: 'keuangan', label: 'Keuangan', icon: Wallet },
              { id: 'kuliah', label: 'Kuliah', icon: CalendarIcon },
              { id: 'pembayaran', label: 'Pembayaran', icon: GraduationCap },
              { id: 'tools', label: 'Fitur Smart Tools', icon: Calculator }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : darkMode ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* TAB KULIAH (AGENDA) */}
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
                  className="w-full border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              {searchAgenda && (
                <div className="mt-2 space-y-1">
                  {events.filter(e => e.judul.toLowerCase().includes(searchAgenda.toLowerCase())).map(ev => (
                    <div key={ev.id} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{ev.judul}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">{ev.tanggal} ({ev.jam})</span>
                        <button onClick={() => setEditingAgenda(ev)} className="text-blue-600 hover:underline text-[10px] font-bold">Edit</button>
                        <button onClick={() => deleteAgenda(ev.id)} className="text-rose-600 hover:underline text-[10px] font-bold">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIST AGENDA & FITUR EDIT */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Daftar Agenda Terjadwal</span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada agenda kuliah yang tersimpan.</p>
                ) : (
                  events.map(ev => (
                    <div key={ev.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{ev.judul}</p>
                        <p className="text-[10px] text-slate-500">
                          {ev.tanggal} s/d {ev.tanggal_selesai || ev.tanggal} • {ev.seharian ? 'Seharian' : `${ev.jam} - ${ev.jam_selesai}`}
                        </p>
                        {ev.keterangan && <p className="text-[10px] text-slate-400 italic">{ev.keterangan}</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setEditingAgenda(ev)} 
                          className="p-1.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg font-bold hover:bg-blue-100 text-[10px]"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => deleteAgenda(ev.id)} 
                          className="p-1.5 bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-lg font-bold hover:bg-rose-100 text-[10px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* FORM TAMBAH AGENDA */}
            <form onSubmit={addAgenda} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-5 rounded-2xl border shadow-sm space-y-3`}>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Tambah Agenda Baru</span>
              </h3>

              <input
                type="text"
                placeholder="Judul agenda/kuliah/ujian..."
                value={agendaForm.judul}
                onChange={(e) => setAgendaForm({ ...agendaForm, judul: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Tanggal Mulai</label>
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
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    min={agendaForm.tanggal}
                    value={agendaForm.tanggal_selesai}
                    onChange={(e) => setAgendaForm({ ...agendaForm, tanggal_selesai: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <label htmlFor="seharian" className="text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  Seharian (24 Jam)
                </label>
              </div>

              {!agendaForm.seharian && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Jam Mulai</label>
                    <input
                      type="time"
                      value={agendaForm.jam}
                      onChange={(e) => setAgendaForm({ ...agendaForm, jam: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Jam Selesai</label>
                    <input
                      type="time"
                      value={agendaForm.jam_selesai}
                      onChange={(e) => setAgendaForm({ ...agendaForm, jam_selesai: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Keterangan tambahan (opsional)"
                value={agendaForm.keterangan}
                onChange={(e) => setAgendaForm({ ...agendaForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                + Simpan Agenda
              </button>
            </form>
          </div>
        )}

        {/* MODAL EDIT AGENDA */}
        {editingAgenda && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-5 rounded-2xl max-w-md w-full border shadow-2xl space-y-3`}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Edit Agenda Kuliah</h3>
                <button onClick={() => setEditingAgenda(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={updateAgenda} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Judul Agenda</label>
                  <input
                    type="text"
                    value={editingAgenda.judul}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, judul: e.target.value })}
                    className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={editingAgenda.tanggal}
                      onChange={(e) => setEditingAgenda({ ...editingAgenda, tanggal: e.target.value })}
                      className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={editingAgenda.tanggal_selesai || editingAgenda.tanggal}
                      onChange={(e) => setEditingAgenda({ ...editingAgenda, tanggal_selesai: e.target.value })}
                      className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-seharian"
                    checked={editingAgenda.seharian}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, seharian: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <label htmlFor="edit-seharian" className="font-semibold text-slate-700 dark:text-slate-300">Seharian (24 Jam)</label>
                </div>

                {!editingAgenda.seharian && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Jam Mulai</label>
                      <input
                        type="time"
                        value={editingAgenda.jam}
                        onChange={(e) => setEditingAgenda({ ...editingAgenda, jam: e.target.value })}
                        className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Jam Selesai</label>
                      <input
                        type="time"
                        value={editingAgenda.jam_selesai}
                        onChange={(e) => setEditingAgenda({ ...editingAgenda, jam_selesai: e.target.value })}
                        className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={editingAgenda.keterangan || ''}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, keterangan: e.target.value })}
                    className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditingAgenda(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 py-2 rounded-xl font-bold">Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB FITUR SMART TOOLS (20 IN 1 ENHANCED) */}
        {activeTab === 'tools' && !isFullscreen && (
          <div className="space-y-5">
            
            {/* 1. KALKULATOR GPA (IPK) INTERAKTIF FULL FIX */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-4`}>
              <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Kalkulator & Target IPK (GPA)</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Kelola mata kuliah, hitung Indeks Prestasi, dan simulasikan target nilai.</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-2 rounded-xl text-center">
                  <span className="text-[9px] font-extrabold uppercase block">IPK Anda</span>
                  <span className="text-xl font-black">{calculateGPA()}</span>
                </div>
              </div>

              {/* Form Tambah Mata Kuliah */}
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nama Matkul..."
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="sm:col-span-2 border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <select
                  value={newCourse.gpa}
                  onChange={(e) => setNewCourse({ ...newCourse, gpa: Number(e.target.value) })}
                  className="border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value={4.0}>Nilai A (4.0)</option>
                  <option value={3.5}>Nilai A- / B+ (3.5)</option>
                  <option value={3.0}>Nilai B (3.0)</option>
                  <option value={2.5}>Nilai B- / C+ (2.5)</option>
                  <option value={2.0}>Nilai C (2.0)</option>
                  <option value={1.0}>Nilai D (1.0)</option>
                  <option value={0.0}>Nilai F (0.0)</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="6"
                    placeholder="SKS"
                    value={newCourse.sks}
                    onChange={(e) => setNewCourse({ ...newCourse, sks: e.target.value })}
                    className="w-16 border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs transition">
                    + Tambah
                  </button>
                </div>
              </form>

              {/* Table List Matkul */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-1.5">Mata Kuliah</th>
                      <th className="py-1.5">Nilai (GPA)</th>
                      <th className="py-1.5">SKS</th>
                      <th className="py-1.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gpaCourses.map(c => (
                      <tr key={c.id}>
                        <td className="py-2 font-semibold text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="py-2 font-bold text-amber-500">{c.gpa.toFixed(1)}</td>
                        <td className="py-2 text-slate-500">{c.sks} SKS</td>
                        <td className="py-2 text-right">
                          <button onClick={() => setEditingCourse(c)} className="text-blue-500 hover:underline mr-2 font-bold text-[10px]">Edit</button>
                          <button onClick={() => handleDeleteCourse(c.id)} className="text-rose-500 hover:underline font-bold text-[10px]">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simulator Target IPK */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">🎯 Target Simulator IPK</span>
                  <span className="text-[10px] text-slate-500">Total SKS Terambil: {gpaCourses.reduce((sum, c) => sum + Number(c.sks), 0)} SKS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Target IPK:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={targetGpaInput}
                    onChange={(e) => setTargetGpaInput(e.target.value)}
                    className="w-16 border rounded-lg p-1 text-center font-bold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* MODAL EDIT MATKUL */}
            {editingCourse && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-4 rounded-2xl max-w-xs w-full border shadow-2xl space-y-3`}>
                  <h4 className="font-bold text-xs">Edit Mata Kuliah</h4>
                  <form onSubmit={handleUpdateCourse} className="space-y-2 text-xs">
                    <input
                      type="text"
                      value={editingCourse.name}
                      onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                      className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      required
                    />
                    <select
                      value={editingCourse.gpa}
                      onChange={(e) => setEditingCourse({ ...editingCourse, gpa: Number(e.target.value) })}
                      className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value={4.0}>Nilai A (4.0)</option>
                      <option value={3.5}>Nilai A- / B+ (3.5)</option>
                      <option value={3.0}>Nilai B (3.0)</option>
                      <option value={2.5}>Nilai B- / C+ (2.5)</option>
                      <option value={2.0}>Nilai C (2.0)</option>
                      <option value={1.0}>Nilai D (1.0)</option>
                      <option value={0.0}>Nilai F (0.0)</option>
                    </select>
                    <input
                      type="number"
                      value={editingCourse.sks}
                      onChange={(e) => setEditingCourse({ ...editingCourse, sks: Number(e.target.value) })}
                      className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setEditingCourse(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 py-1.5 rounded-xl font-bold">Batal</button>
                      <button type="submit" className="flex-1 bg-amber-500 text-white py-1.5 rounded-xl font-bold">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. POMODORO TIMER INTERAKTIF */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>Timer Fokus Belajar (Pomodoro)</span>
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${pomoMode === 'work' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {pomoMode === 'work' ? '🧠 Sesi Fokus Belajar' : '☕ Istirahat Sejenak'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-3xl font-mono font-black text-slate-900 dark:text-white">
                  {Math.floor(pomoTime / 60).toString().padStart(2, '0')}:{(pomoTime % 60).toString().padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPomoActive(!pomoActive)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 shadow-md ${pomoActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-600 hover:bg-rose-700'}`}
                  >
                    {pomoActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{pomoActive ? 'Jeda' : 'Mulai'}</span>
                  </button>
                  <button
                    onClick={() => { setPomoActive(false); setPomoTime(pomoMode === 'work' ? 25 * 60 : 5 * 60); }}
                    className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl text-slate-600 dark:text-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. TARGET MENABUNG & SPLIT BILL CALCULATOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Savings Target */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
                <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>Target Menabung Barang Impian</span>
                </h3>

                <div className="space-y-2">
                  {savingsGoals.map(goal => {
                    const pct = Math.min(Math.round((goal.currentYuan / goal.targetYuan) * 100), 100);
                    return (
                      <div key={goal.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-200">{goal.name}</span>
                          <span className="text-emerald-500">{pct}% ({formatYuan(goal.currentYuan)})</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Split Bill Calculator */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
                <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-500" />
                  <span>Kalkulator Split Bill Patungan</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <input
                    type="number"
                    placeholder="Total Tagihan (Yuan ¥)..."
                    value={splitBillAmount}
                    onChange={(e) => setSplitBillAmount(e.target.value)}
                    className="w-full border p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Jumlah Orang:</span>
                    <input
                      type="number"
                      min="1"
                      value={splitBillPeople}
                      onChange={(e) => setSplitBillPeople(e.target.value)}
                      className="w-16 border p-1 rounded-lg text-center font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  {splitBillAmount && (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                      <span className="text-[10px] text-blue-500 font-bold block">Bayar per Orang:</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-300">
                        ¥ {(Number(splitBillAmount) / (Number(splitBillPeople) || 1)).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ({formatIDR(Number(splitBillAmount) / (Number(splitBillPeople) || 1))})
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 4. DRINK WATER TRACKER & STICKY NOTE MEMO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Drink Water Tracker */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-3`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <span>Hydration Tracker (Minum Air)</span>
                  </h3>
                  <span className="text-xs font-black text-cyan-500">{waterGlasses} / 8 Gelas</span>
                </div>

                <div className="flex items-center gap-1.5 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                    <button
                      key={g}
                      onClick={() => setWaterGlasses(g === waterGlasses ? g - 1 : g)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition border ${g <= waterGlasses ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    >
                      🥛
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticky Note Quick Memo */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm space-y-2`}>
                <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-amber-500" />
                  <span>Catatan Cepat (Auto Save)</span>
                </h3>
                <textarea
                  rows="3"
                  placeholder="Tulis ide atau pengingat cepat di sini..."
                  value={stickyNote}
                  onChange={(e) => setStickyNote(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-xs bg-amber-50/50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                ></textarea>
              </div>

            </div>

            {/* 5. BACKUP & RESTORE DATA APLIKASI */}
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Cadangan & Pemulihan Data (Backup JSON)</span>
                </h3>
                <p className="text-[10px] text-slate-400">Simpan cadangan lokal seluruh data transaksi, agenda, dan tugas Anda.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportFullBackupJSON}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Backup</span>
                </button>
                <label className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Backup</span>
                  <input type="file" accept=".json" onChange={handleImportBackupJSON} className="hidden" />
                </label>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
