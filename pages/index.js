import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  Clock, AlertCircle, Edit2, ArrowUpRight, ArrowDownRight, X, Info, Trash2, Plus,
  CheckSquare, Square, AlertTriangle, ListTodo
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kursRate, setKursRate] = useState(2200);
  const [editingKurs, setEditingKurs] = useState(false);
  const [tempKurs, setTempKurs] = useState(2200);

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
  const [editingEvent, setEditingEvent] = useState(null);
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
    // 1. Fetch data awal saat aplikasi dimuat
    fetchKurs();
    fetchTransactions();
    fetchEvents();
    fetchPayments();
    fetchTodos();

    // 2. LISTEN REALTIME CHANGES FROM SUPABASE
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transaksi' },
        () => fetchTransactions()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda_kuliah' },
        () => fetchEvents()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pembayaran_kuliah' },
        () => fetchPayments()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todo_tugas' },
        () => fetchTodos()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pengaturan' },
        () => fetchKurs()
      )
      .subscribe();

    // Clean up listener saat komponen di-unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- SUPABASE API CALLS ---
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

  async function deleteTransaction(id) {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    await supabase.from('transaksi').delete().eq('id', id);
  }

  async function updateTransaction(e) {
    e.preventDefault();
    if (!editingTransaction) return;

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

  async function fetchEvents() {
    const { data } = await supabase.from('agenda_kuliah').select('*').order('tanggal', { ascending: true });
    if (data) setEvents(data);
  }

  async function addAgenda(e) {
    e.preventDefault();
    if (!agendaForm.judul.trim()) {
      alert('Silakan isi Judul agenda terlebih dahulu!');
      return;
    }

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

    if (error) {
      alert('Gagal menyimpan agenda: ' + error.message);
      return;
    }

    setAgendaForm({ 
      judul: '', 
      tanggal: new Date().toISOString().split('T')[0], 
      tanggal_selesai: new Date().toISOString().split('T')[0],
      jam: '09:00', 
      jam_selesai: '10:00',
      seharian: false,
      keterangan: '' 
    });

    alert('Agenda berhasil disimpan!');
  }

  async function updateAgenda(e) {
    e.preventDefault();
    if (!editingEvent || !editingEvent.judul.trim()) {
      alert('Judul agenda tidak boleh kosong!');
      return;
    }

    const payload = {
      judul: editingEvent.judul,
      tanggal: editingEvent.tanggal,
      tanggal_selesai: editingEvent.tanggal_selesai || editingEvent.tanggal,
      jam: editingEvent.seharian ? '00:00' : (editingEvent.jam || '09:00'),
      jam_selesai: editingEvent.seharian ? '23:59' : (editingEvent.jam_selesai || '10:00'),
      seharian: editingEvent.seharian,
      keterangan: editingEvent.keterangan
    };

    const { error } = await supabase.from('agenda_kuliah').update(payload).eq('id', editingEvent.id);

    if (error) {
      alert('Gagal memperbarui agenda: ' + error.message);
      return;
    }

    setEditingEvent(null);
    setSelectedDateEvents(null);
  }

  async function deleteAgenda(id) {
    if (!window.confirm('Hapus agenda ini?')) return;
    await supabase.from('agenda_kuliah').delete().eq('id', id);
    if (selectedDateEvents) {
      setSelectedDateEvents(prev => ({
        ...prev,
        list: prev.list.filter(ev => ev.id !== id)
      }));
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

  async function deletePayment(id) {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) return;
    await supabase.from('pembayaran_kuliah').delete().eq('id', id);
  }

  // --- API TO DO LIST TUGAS ---
  async function fetchTodos() {
    const { data } = await supabase.from('todo_tugas').select('*').order('selesai', { ascending: true }).order('tenggat_waktu', { ascending: true });
    if (data) setTodos(data);
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!todoForm.judul.trim()) return;

    const { error: todoError } = await supabase.from('todo_tugas').insert([{
      judul: todoForm.judul,
      tenggat_waktu: todoForm.tenggat_waktu,
      selesai: false
    }]);

    if (todoError) {
      alert('Gagal menambah tugas: ' + todoError.message);
      return;
    }

    await supabase.from('agenda_kuliah').insert([{
      judul: `[Tugas] ${todoForm.judul}`,
      tanggal: todoForm.tenggat_waktu,
      tanggal_selesai: todoForm.tenggat_waktu,
      jam: '23:59',
      jam_selesai: '23:59',
      seharian: true,
      keterangan: 'Tugas dari To-Do List'
    }]);

    setTodoForm({ judul: '', tenggat_waktu: new Date().toISOString().split('T')[0] });
  }

  async function toggleTodoStatus(id, currentStatus) {
    await supabase.from('todo_tugas').update({ selesai: !currentStatus }).eq('id', id);
  }

  async function deleteTodo(id) {
    if (!window.confirm('Hapus tugas ini dari To-Do list?')) return;
    await supabase.from('todo_tugas').delete().eq('id', id);
  }

  // --- HELPER PRIORITAS TUGAS ---
  const getAutoPriority = (dueDateStr) => {
    if (!dueDateStr) return { label: 'Rendah', badgeColor: 'bg-slate-100 text-slate-600', blockBg: 'bg-slate-50 border-slate-100' };
    
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    
    const dueObj = new Date(dueDateStr);
    dueObj.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueObj - todayObj) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return { 
        label: 'Tinggi', 
        badgeColor: 'bg-rose-500 text-white font-bold', 
        blockBg: 'bg-rose-50/80 border-rose-200' 
      };
    } else if (diffDays <= 3) {
      return { 
        label: 'Sedang', 
        badgeColor: 'bg-amber-500 text-white font-semibold', 
        blockBg: 'bg-amber-50/80 border-amber-200' 
      };
    } else {
      return { 
        label: 'Rendah', 
        badgeColor: 'bg-slate-200 text-slate-700', 
        blockBg: 'bg-slate-50/50 border-slate-100' 
      };
    }
  };

  // --- HELPERS UMUM ---
  const formatYuan = (val) => `¥ ${Number(val || 0).toLocaleString('id-ID')}`;
  const formatIDR = (val) => `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  const currentMonthTransactions = transactions.filter(t => t.tanggal.startsWith(selectedMonth));
  const monthIncomeYuan = currentMonthTransactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthExpenseYuan = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  
  const monthNonCollegeExpenseYuan = currentMonthTransactions
    .filter(t => t.tipe === 'pengeluaran' && t.kategori !== 'Biaya Kuliah')
    .reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);

  const categoryExpenses = expenseCategories.map(cat => {
    const total = currentMonthTransactions
      .filter(t => t.tipe === 'pengeluaran' && t.kategori === cat)
      .reduce((sum, t) => sum + Number(t.nominal_yuan), 0);
    return { kategori: cat, total };
  }).filter(item => item.total > 0);

  const totalPaymentYuan = payments.reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const paidPaymentYuan = payments.filter(p => p.sudah_dibayar).reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const unpaidPaymentYuan = totalPaymentYuan - paidPaymentYuan;

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const unpaidAlerts = payments.filter(p => {
    if (p.sudah_dibayar || !p.tenggat_waktu) return false;
    const dueDate = new Date(p.tenggat_waktu);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  });

  const upcomingEvents = events
    .map(ev => {
      const endDateStr = ev.tanggal_selesai || ev.tanggal;
      const endTimeStr = ev.seharian ? '23:59:59' : (ev.jam_selesai || ev.jam || '23:59:59');
      const eventEndDateTime = new Date(`${endDateStr}T${endTimeStr}`);
      
      const startTimeStr = ev.seharian ? '00:00:00' : (ev.jam || '00:00:00');
      const eventStartDateTime = new Date(`${ev.tanggal}T${startTimeStr}`);
      
      const diffMs = eventStartDateTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      return { ...ev, eventEndDateTime, eventStartDateTime, diffHours };
    })
    .filter(ev => ev.eventEndDateTime > now)
    .sort((a, b) => a.eventStartDateTime - b.eventStartDateTime);

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
      {
        label: 'Pemasukan (¥)',
        data: incomeDataByMonth,
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.3,
      },
      {
        label: 'Pengeluaran (¥)',
        data: expenseDataByMonth,
        borderColor: '#f43f5e',
        backgroundColor: '#f43f5e',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
    },
    scales: {
      y: { ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } }
    }
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getEventsForDate = (dateStr) => {
    return events.filter((ev) => {
      const startDate = ev.tanggal;
      const endDate = ev.tanggal_selesai || ev.tanggal;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const handleDateClick = (dateStr) => {
    const dayEvents = getEventsForDate(dateStr);
    setSelectedDateEvents({ date: dateStr, list: dayEvents });
  };

  const renderCalendar = () => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>📅</span> Kalender Agenda Kuliah & Tugas
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold px-2"
          >
            &lt;
          </button>
          <span className="text-xs font-semibold text-slate-700 min-w-[100px] text-center">
            {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold px-2"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
        <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="h-16 bg-slate-50/50 rounded-lg"></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = getEventsForDate(dateStr);

          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(dateStr)}
              className="h-16 p-1 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-lg flex flex-col justify-between cursor-pointer transition overflow-hidden group"
            >
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-600">{day}</span>
              <div className="space-y-0.5 overflow-y-auto max-h-10">
                {dayEvents.map((ev) => (
                  <div 
                    key={ev.id} 
                    className={`text-[8px] px-1 py-0.5 rounded truncate font-medium border ${
                      ev.judul.startsWith('[Tugas]') 
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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* Header App */}
        <header className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Manager</h1>
            <p className="text-xs text-slate-500">Keuangan, Kuliah & Pembayaran</p>
          </div>
          <div className="bg-slate-100 p-2 rounded-xl text-right border border-slate-200">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs text-slate-500">1 RMB =</span>
              {editingKurs ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempKurs}
                    onChange={(e) => setTempKurs(e.target.value)}
                    className="w-20 bg-white border border-slate-300 text-xs rounded px-1 py-0.5"
                  />
                  <button onClick={updateKurs} className="text-xs bg-emerald-600 px-2 py-0.5 text-white font-bold rounded">OK</button>
                </div>
              ) : (
                <button onClick={() => setEditingKurs(true)} className="flex items-center gap-1 font-bold text-blue-600 text-xs">
                  <span>Rp {kursRate.toLocaleString('id-ID')}</span>
                  <Edit2 className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
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

        {/* TAB UTAMA / DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {unpaidAlerts.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Peringatan Pembayaran Tenggat Waktu!</span>
                </div>
                {unpaidAlerts.map(p => (
                  <div key={p.id} className="text-xs flex justify-between text-amber-900 mt-1">
                    <span>{p.kategori_tahun} - {p.nama_tagihan}</span>
                    <span className="font-semibold">{formatYuan(p.jumlah_yuan)} (Tenggat: {p.tenggat_waktu})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rekapitulasi Keuangan */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 font-medium">Rekapitulasi Keuangan</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5"/> Pemasukan</p>
                  <p className="text-base font-bold text-emerald-300">{formatYuan(monthIncomeYuan)}</p>
                  <p className="text-xs text-slate-400">{formatIDR(monthIncomeYuan)}</p>
                </div>
                <div>
                  <p className="text-xs text-rose-400 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5"/> Pengeluaran (Total)</p>
                  <p className="text-base font-bold text-rose-300">{formatYuan(monthExpenseYuan)}</p>
                  <p className="text-xs text-slate-400">{formatIDR(monthExpenseYuan)}</p>
                </div>
              </div>

              {/* Pengeluaran Bulanan (Diluar Biaya Kuliah) */}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-amber-400 font-medium">Pengeluaran Bulanan</p>
                  <p className="text-[10px] text-slate-400">Diluar Biaya Kuliah</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-300">{formatYuan(monthNonCollegeExpenseYuan)}</p>
                  <p className="text-[10px] text-slate-400">{formatIDR(monthNonCollegeExpenseYuan)}</p>
                </div>
              </div>

              {/* Rincian Pengeluaran Per Kategori */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold">Total Pengeluaran Per Kategori:</p>
                {categoryExpenses.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">Belum ada pengeluaran pada bulan ini.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {categoryExpenses.map(item => (
                      <div key={item.kategori} className="flex justify-between items-center bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 font-medium">{item.kategori}</span>
                        <div className="text-right">
                          <span className="font-bold text-rose-300">{formatYuan(item.total)}</span>
                          <span className="block text-[9px] text-slate-400">{formatIDR(item.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEKSI TO DO TUGAS DI DASHBOARD */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-amber-600" />
                  <span>Daftar Tugas Mendatang</span>
                </h2>
                <button 
                  onClick={() => setActiveTab('todo')} 
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Lihat Semua ({todos.filter(t => !t.selesai).length})
                </button>
              </div>

              <div className="space-y-2">
                {todos.filter(t => !t.selesai).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Semua tugas telah selesai / belum ada tugas.</p>
                ) : (
                  todos.filter(t => !t.selesai).slice(0, 4).map(item => {
                    const priority = getAutoPriority(item.tenggat_waktu);

                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 border rounded-xl flex justify-between items-center transition ${priority.blockBg}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => toggleTodoStatus(item.id, item.selesai)}>
                            <Square className="w-4 h-4 text-slate-300 hover:text-emerald-600" />
                          </button>
                          <div>
                            <p className="font-bold text-xs text-slate-800">{item.judul}</p>
                            <p className="text-[10px] text-slate-500">Tenggat: {item.tenggat_waktu}</p>
                          </div>
                        </div>

                        <span className={`text-[9px] px-2 py-0.5 rounded ${priority.badgeColor}`}>
                          Prioritas {priority.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SEKSI AGENDA KULIAH TERDEKAT */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Agenda Kuliah Terdekat</span>
                </h2>
                <span className="text-[10px] text-slate-400">Mendatang</span>
              </div>

              <div className="space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada agenda terdekat / jam agenda telah lewat.</p>
                ) : (
                  upcomingEvents.slice(0, 4).map(ev => {
                    const isWithin24Hours = ev.diffHours >= 0 && ev.diffHours <= 24;

                    return (
                      <div 
                        key={ev.id} 
                        className={`p-3 rounded-xl border flex justify-between items-center transition ${
                          isWithin24Hours 
                            ? 'bg-amber-100/70 border-amber-300 text-amber-900' 
                            : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs">{ev.judul}</p>
                            {isWithin24Hours && (
                              <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-md">
                                Segera (&lt; 24 jam)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {ev.tanggal} {ev.tanggal_selesai && ev.tanggal_selesai !== ev.tanggal ? `s/d ${ev.tanggal_selesai}` : ''} • {ev.seharian ? 'Seharian (24 Jam)' : `${ev.jam || '-'} - ${ev.jam_selesai || '-'}`}
                          </p>
                          {ev.keterangan && <p className="text-[10px] text-slate-400">{ev.keterangan}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Grafik Keuangan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xs text-slate-800">Grafik Keuangan</h2>
                <span className="text-[10px] text-slate-400 font-medium">Bulanan (Yuan)</span>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {renderCalendar()}
          </div>
        )}

        {/* TAB TO DO LIST TUGAS */}
        {activeTab === 'todo' && (
          <div className="space-y-5">
            <form onSubmit={addTodo} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Tambah Tugas Baru</span>
              </h3>

              <input
                type="text"
                placeholder="Nama Tugas/Praktikum..."
                value={todoForm.judul}
                onChange={(e) => setTodoForm({ ...todoForm, judul: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                required
              />

              <div>
                <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tenggat Waktu</label>
                <input
                  type="date"
                  value={todoForm.tenggat_waktu}
                  onChange={(e) => setTodoForm({ ...todoForm, tenggat_waktu: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                + Tambah Tugas
              </button>
            </form>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xs text-slate-700">Daftar Tugas & PR</h2>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {todos.filter(t => t.selesai).length} / {todos.length} Selesai
                </span>
              </div>

              <div className="space-y-2">
                {todos.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada tugas tercatat.</p>
                ) : (
                  todos.map((item) => {
                    const isOverdue = new Date(item.tenggat_waktu) < today && !item.selesai;
                    const priority = getAutoPriority(item.tenggat_waktu);

                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 border rounded-xl flex justify-between items-center transition ${item.selesai ? 'bg-slate-50 border-slate-100 opacity-60' : priority.blockBg}`}
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleTodoStatus(item.id, item.selesai)}
                            className="text-blue-600 hover:scale-110 transition"
                          >
                            {item.selesai ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>

                          <div>
                            <p className={`text-xs font-bold ${item.selesai ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {item.judul}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded ${priority.badgeColor}`}>
                                Prioritas {priority.label}
                              </span>
                              <span className={`text-[10px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                Tenggat: {item.tenggat_waktu}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTodo(item.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="space-y-5">
            <form onSubmit={addTransaction} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Catat Transaksi</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pengeluaran' })}
                  className={`py-2 rounded-xl text-xs font-bold border ${financeForm.tipe === 'pengeluaran' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-600'}`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pemasukan' })}
                  className={`py-2 rounded-xl text-xs font-bold border ${financeForm.tipe === 'pemasukan' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-600'}`}
                >
                  Pemasukan
                </button>
              </div>

              {financeForm.tipe === 'pengeluaran' && (
                <select
                  value={financeForm.kategori}
                  onChange={(e) => setFinanceForm({ ...financeForm, kategori: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                >
                  {expenseCategories.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              )}

              <input
                type="number"
                step="any"
                placeholder="Nominal (¥ Yuan)"
                value={financeForm.nominalYuan}
                onChange={(e) => setFinanceForm({ ...financeForm, nominalYuan: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                required
              />

              <input
                type="date"
                value={financeForm.tanggal}
                onChange={(e) => setFinanceForm({ ...financeForm, tanggal: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
              />

              <input
                type="text"
                placeholder="Keterangan..."
                value={financeForm.keterangan}
                onChange={(e) => setFinanceForm({ ...financeForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
              />

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">Simpan Transaksi</button>
            </form>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Riwayat Mutasi</h2>
              <div className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <div key={t.id} className="py-3 flex justify-between items-center text-xs group hover:bg-slate-50 p-2 rounded-xl transition">
                    <div>
                      <p className="font-bold text-slate-800">{t.keterangan || t.kategori}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.tanggal} • {t.kategori}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingTransaction(t)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB KULIAH */}
        {activeTab === 'kuliah' && (
          <div className="space-y-5">
            {renderCalendar()}

            <form onSubmit={addAgenda} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Tambah Agenda Baru</span>
              </h3>

              <input
                type="text"
                placeholder="Judul agenda/tugas"
                value={agendaForm.judul}
                onChange={(e) => setAgendaForm({ ...agendaForm, judul: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    min={agendaForm.tanggal}
                    value={agendaForm.tanggal_selesai}
                    onChange={(e) => setAgendaForm({ ...agendaForm, tanggal_selesai: e.target.value })}
                    className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
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
                <label htmlFor="seharian" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
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
                      className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Jam Selesai</label>
                    <input
                      type="time"
                      value={agendaForm.jam_selesai}
                      onChange={(e) => setAgendaForm({ ...agendaForm, jam_selesai: e.target.value })}
                      className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Keterangan tambahan (opsional)"
                value={agendaForm.keterangan}
                onChange={(e) => setAgendaForm({ ...agendaForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
              />

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition">
                + Simpan Agenda
              </button>
            </form>
          </div>
        )}

        {/* TAB PEMBAYARAN KULIAH */}
        {activeTab === 'pembayaran' && (
          <div className="space-y-5">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
              <span className="text-xs text-slate-400">Total Ringkasan Pembayaran Kuliah</span>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-xs text-emerald-400">Lunas</p>
                  <p className="text-base font-bold text-emerald-300">{formatYuan(paidPaymentYuan)}</p>
                  <p className="text-xs text-slate-400">{formatIDR(paidPaymentYuan)}</p>
                </div>
                <div>
                  <p className="text-xs text-rose-400">Belum Lunas</p>
                  <p className="text-base font-bold text-rose-300">{formatYuan(unpaidPaymentYuan)}</p>
                  <p className="text-xs text-slate-400">{formatIDR(unpaidPaymentYuan)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {['Tahun Bahasa', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4'].map(thn => (
                <button
                  key={thn}
                  onClick={() => setSelectedPaymentYear(thn)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border ${selectedPaymentYear === thn ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {thn}
                </button>
              ))}
            </div>

            <form onSubmit={addPayment} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Tambah Tagihan ({selectedPaymentYear})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Tagihan (ex: Asuransi)"
                  value={newPaymentForm.nama_tagihan}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, nama_tagihan: e.target.value })}
                  className="border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                  required
                />
                <input
                  type="number"
                  placeholder="Nominal (¥ Yuan)"
                  value={newPaymentForm.jumlah_yuan}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, jumlah_yuan: e.target.value })}
                  className="border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                  required
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newPaymentForm.tenggat_waktu}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, tenggat_waktu: e.target.value })}
                  className="w-1/2 border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                />
                <button type="submit" className="w-1/2 bg-blue-600 text-white p-2 rounded-xl text-xs font-bold shadow-md">
                  Simpan Tagihan
                </button>
              </div>
            </form>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              <div className="p-3.5 bg-slate-50 font-bold text-xs text-slate-700">
                Rincian Tagihan - {selectedPaymentYear}
              </div>
              {payments.filter(p => p.kategori_tahun === selectedPaymentYear).map(item => (
                <div key={item.id} className="p-4 space-y-2 group hover:bg-slate-50/50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{item.nama_tagihan}</p>
                      <p className="text-xs font-bold text-blue-600">{formatYuan(item.jumlah_yuan)}</p>
                      <p className="text-[10px] text-slate-400">Prakiraan: {formatIDR(item.jumlah_yuan)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePaymentStatus(item.id, item.sudah_dibayar)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition ${item.sudah_dibayar ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {item.sudah_dibayar ? '✓ Lunas' : 'Belum Dibayar'}
                      </button>

                      <button
                        onClick={() => setEditingPayment(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deletePayment(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-[10px] text-slate-500">
                    <span>Tenggat Waktu:</span>
                    {editingDueDateId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={tempDueDate}
                          onChange={(e) => setTempDueDate(e.target.value)}
                          className="border border-slate-300 rounded px-1 text-[10px]"
                        />
                        <button onClick={() => saveDueDate(item.id)} className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold">Simpan</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingDueDateId(item.id); setTempDueDate(item.tenggat_waktu || ''); }} className="font-semibold text-blue-600 flex items-center gap-1">
                        {item.tenggat_waktu || 'Set Tanggal'}
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL POP-UP DETAILS AGENDA KALENDER */}
        {selectedDateEvents && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">
                  Agenda Tanggal: {selectedDateEvents.date}
                </h3>
                <button 
                  onClick={() => setSelectedDateEvents(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedDateEvents.list.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Tidak ada agenda pada tanggal ini.</p>
                ) : (
                  selectedDateEvents.list.map((ev) => (
                    <div key={ev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-slate-800">{ev.judul}</p>
                        <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ev.seharian ? 'Seharian (24 Jam)' : `${ev.jam || '-'} - ${ev.jam_selesai || '-'}`}
                        </p>
                        {ev.keterangan && (
                          <p className="text-[10px] text-slate-500">{ev.keterangan}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditingEvent(ev)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Agenda"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteAgenda(ev.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setSelectedDateEvents(null)}
                className="w-full bg-slate-100 text-slate-700 py-2 rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* MODAL POP-UP EDIT AGENDA KULIAH */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Edit Agenda Kuliah</h3>
                <button 
                  onClick={() => setEditingEvent(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={updateAgenda} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Judul Agenda/Tugas</label>
                  <input
                    type="text"
                    value={editingEvent.judul}
                    onChange={(e) => setEditingEvent({ ...editingEvent, judul: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={editingEvent.tanggal}
                      onChange={(e) => setEditingEvent({ ...editingEvent, tanggal: e.target.value })}
                      className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={editingEvent.tanggal_selesai || editingEvent.tanggal}
                      onChange={(e) => setEditingEvent({ ...editingEvent, tanggal_selesai: e.target.value })}
                      className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit_seharian"
                    checked={editingEvent.seharian || false}
                    onChange={(e) => setEditingEvent({ ...editingEvent, seharian: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="edit_seharian" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                    Seharian (24 Jam)
                  </label>
                </div>

                {!editingEvent.seharian && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Jam Mulai</label>
                      <input
                        type="time"
                        value={editingEvent.jam || '09:00'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, jam: e.target.value })}
                        className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 mb-1 block">Jam Selesai</label>
                      <input
                        type="time"
                        value={editingEvent.jam_selesai || '10:00'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, jam_selesai: e.target.value })}
                        className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Keterangan</label>
                  <input
                    type="text"
                    value={editingEvent.keterangan || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, keterangan: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="w-1/2 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
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
                    className={`py-2 rounded-xl text-xs font-bold border ${editingTransaction.tipe === 'pengeluaran' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-600'}`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTransaction({ ...editingTransaction, tipe: 'pemasukan' })}
                    className={`py-2 rounded-xl text-xs font-bold border ${editingTransaction.tipe === 'pemasukan' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-600'}`}
                  >
                    Pemasukan
                  </button>
                </div>

                {editingTransaction.tipe === 'pengeluaran' && (
                  <select
                    value={editingTransaction.kategori}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, kategori: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  >
                    {expenseCategories.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Nominal Yuan (¥)</label>
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
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={editingTransaction.tanggal}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, tanggal: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Keterangan / Judul</label>
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
