import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  TrendingUp, TrendingDown, Clock, AlertCircle, Plus, Edit2, ArrowUpRight, ArrowDownRight, X, Info
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kursRate, setKursRate] = useState(2200);
  const [editingKurs, setEditingKurs] = useState(false);
  const [tempKurs, setTempKurs] = useState(2200);

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

  // States Kuliah & Kalender
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState(null); // Pop-up state
  const [agendaForm, setAgendaForm] = useState({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam: '09:00',
    keterangan: ''
  });

  // States Pembayaran Kuliah
  const [payments, setPayments] = useState([]);
  const [selectedPaymentYear, setSelectedPaymentYear] = useState('Tahun Bahasa');
  const [editingDueDateId, setEditingDueDateId] = useState(null);
  const [tempDueDate, setTempDueDate] = useState('');

  useEffect(() => {
    fetchKurs();
    fetchTransactions();
    fetchEvents();
    fetchPayments();
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
    fetchTransactions();
  }

  async function fetchEvents() {
    const { data } = await supabase.from('agenda_kuliah').select('*').order('tanggal', { ascending: true });
    if (data) setEvents(data);
  }

  async function addAgenda(e) {
    e.preventDefault();
    if (!agendaForm.judul) return;
    await supabase.from('agenda_kuliah').insert([agendaForm]);
    setAgendaForm({ judul: '', tanggal: new Date().toISOString().split('T')[0], jam: '09:00', keterangan: '' });
    fetchEvents();
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
    fetchPayments();
  }

  async function saveDueDate(id) {
    await supabase.from('pembayaran_kuliah').update({ tenggat_waktu: tempDueDate || null }).eq('id', id);
    setEditingDueDateId(null);
    fetchPayments();
  }

  // --- HELPERS ---
  const formatYuan = (val) => `¥ ${Number(val || 0).toLocaleString('id-ID')}`;
  const formatIDR = (val) => `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  const currentMonthTransactions = transactions.filter(t => t.tanggal.startsWith(selectedMonth));
  const monthIncomeYuan = currentMonthTransactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthExpenseYuan = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);

  const totalPaymentYuan = payments.reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const paidPaymentYuan = payments.filter(p => p.sudah_dibayar).reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const unpaidPaymentYuan = totalPaymentYuan - paidPaymentYuan;
  const unpaidAlerts = payments.filter(p => !p.sudah_dibayar && p.tenggat_waktu);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDateClick = (dateStr) => {
    const dayEvents = events.filter((e) => e.tanggal === dateStr);
    setSelectedDateEvents({ date: dateStr, list: dayEvents });
  };

  // Komponen Reusable Kalender
  const renderCalendar = () => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>📅</span> Kalender Agenda Kuliah
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
        <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="h-14 bg-slate-50 rounded-lg"></div>
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events.filter((e) => e.tanggal === dateStr);

          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(dateStr)}
              className="h-14 p-1 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-lg flex flex-col justify-between cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-slate-600">{day}</span>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded truncate font-medium">
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

        {/* TAB DASHBOARD UTAMA */}
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
                  <p className="text-xs text-rose-400 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5"/> Pengeluaran</p>
                  <p className="text-base font-bold text-rose-300">{formatYuan(monthExpenseYuan)}</p>
                  <p className="text-xs text-slate-400">{formatIDR(monthExpenseYuan)}</p>
                </div>
              </div>
            </div>

            {/* Kalender di Dashboard Utama */}
            {renderCalendar()}

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600"/> Mutasi Terakhir</h2>
              <div className="divide-y divide-slate-100">
                {transactions.slice(0, 4).map(t => (
                  <div key={t.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold">{t.keterangan || t.kategori}</p>
                      <p className="text-[10px] text-slate-400">{t.tanggal} • {t.kategori}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                      </p>
                      <p className="text-[10px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                    </div>
                  </div>
                ))}
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
                  {['Makan', 'Minum', 'Kuota', 'Jajan', 'Belanja', 'Transportasi', 'Lain-lain'].map(k => (
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
              {financeForm.nominalYuan && <p className="text-[10px] text-slate-500 pl-1">Estimasi: {formatIDR(financeForm.nominalYuan)}</p>}

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

              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md">Simpan Transaksi</button>
            </form>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Riwayat Mutasi</h2>
              <div className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <div key={t.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{t.keterangan || t.kategori}</p>
                      <p className="text-[10px] text-slate-400">{t.tanggal} • {t.kategori}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                      </p>
                      <p className="text-[10px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB KULIAH & KALENDER */}
        {activeTab === 'kuliah' && (
          <div className="space-y-5">
            {renderCalendar()}

            <form onSubmit={addAgenda} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-700">Tambah Agenda Baru</h3>
              <input
                type="text"
                placeholder="Judul agenda/tugas"
                value={agendaForm.judul}
                onChange={(e) => setAgendaForm({ ...agendaForm, judul: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={agendaForm.tanggal}
                  onChange={(e) => setAgendaForm({ ...agendaForm, tanggal: e.target.value })}
                  className="border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                />
                <input
                  type="time"
                  value={agendaForm.jam}
                  onChange={(e) => setAgendaForm({ ...agendaForm, jam: e.target.value })}
                  className="border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
                />
              </div>
              <input
                type="text"
                placeholder="Keterangan tambahan (opsional)"
                value={agendaForm.keterangan}
                onChange={(e) => setAgendaForm({ ...agendaForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs bg-slate-50"
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md">
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

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              <div className="p-3.5 bg-slate-50 font-bold text-xs text-slate-700">
                Rincian Tagihan - {selectedPaymentYear}
              </div>
              {payments.filter(p => p.kategori_tahun === selectedPaymentYear).map(item => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{item.nama_tagihan}</p>
                      <p className="text-xs font-bold text-blue-600">{formatYuan(item.jumlah_yuan)}</p>
                      <p className="text-[10px] text-slate-400">Prakiraan: {formatIDR(item.jumlah_yuan)}</p>
                    </div>
                    <button
                      onClick={() => togglePaymentStatus(item.id, item.sudah_dibayar)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold ${item.sudah_dibayar ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {item.sudah_dibayar ? '✓ Lunas' : 'Belum Dibayar'}
                    </button>
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

        {/* MODAL POP-UP DETAIL AGENDA SAAT TANGGAL DIKLIK */}
        {selectedDateEvents && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Agenda {selectedDateEvents.date}</span>
                </h3>
                <button 
                  onClick={() => setSelectedDateEvents(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedDateEvents.list.length > 0 ? (
                  selectedDateEvents.list.map((ev) => (
                    <div key={ev.id} className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-blue-900">{ev.judul}</p>
                        {ev.jam && <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold">{ev.jam}</span>}
                      </div>
                      {ev.keterangan && <p className="text-[11px] text-slate-600">{ev.keterangan}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">Tidak ada agenda pada tanggal ini.</p>
                )}
              </div>

              <button
                onClick={() => setSelectedDateEvents(null)}
                className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
