import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Wallet, Calendar as CalendarIcon, GraduationCap, LayoutDashboard, 
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Plus, 
  ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownRight, Edit2
} from 'lucide-react';

// Inisialisasi Supabase Client dari Environment Variables
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

  // States Kuliah
  const [events, setEvents] = useState([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
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

  // Fetch Data Awal
  useEffect(() => {
    fetchKurs();
    fetchTransactions();
    fetchEvents();
    fetchPayments();
  }, []);

  // --- API SUPABASE FUNCTIONS ---
  async function fetchKurs() {
    const { data } = await supabase.from('pengaturan').select('value').eq('key', 'kurs_yuan').single();
    if (data) {
      setKursRate(Number(data.value));
      setTempKurs(Number(data.value));
    }
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

    setFinanceForm({
      tipe: 'pengeluaran',
      kategori: 'Makan',
      nominalYuan: '',
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: ''
    });
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
    setAgendaForm({
      judul: '',
      tanggal: new Date().toISOString().split('T')[0],
      jam: '09:00',
      keterangan: ''
    });
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
    await supabase.from('pembayaran_kuliah').update({
      tenggat_waktu: tempDueDate || null
    }).eq('id', id);
    setEditingDueDateId(null);
    fetchPayments();
  }

  // --- REKAPITULASI DUA KURS ---
  const formatYuan = (val) => `¥ ${Number(val || 0).toLocaleString('id-ID')}`;
  const formatIDR = (val) => `Rp ${Math.round(Number(val || 0) * kursRate).toLocaleString('id-ID')}`;

  const currentMonthTransactions = transactions.filter(t => t.tanggal.startsWith(selectedMonth));
  const monthIncomeYuan = currentMonthTransactions.filter(t => t.tipe === 'pemasukan').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);
  const monthExpenseYuan = currentMonthTransactions.filter(t => t.tipe === 'pengeluaran').reduce((acc, curr) => acc + Number(curr.nominal_yuan), 0);

  const totalPaymentYuan = payments.reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const paidPaymentYuan = payments.filter(p => p.sudah_dibayar).reduce((acc, curr) => acc + Number(curr.jumlah_yuan), 0);
  const unpaidPaymentYuan = totalPaymentYuan - paidPaymentYuan;

  const unpaidAlerts = payments.filter(p => !p.sudah_dibayar && p.tenggat_waktu);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans border-x border-slate-200">
      {/* Header Aplikasi & Input Kurs */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg leading-tight">Student Manager</h1>
            <p className="text-xs text-slate-400">Keuangan, Kuliah & Pembayaran</p>
          </div>
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[10px] text-slate-400">1 RMB =</span>
              {editingKurs ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempKurs}
                    onChange={(e) => setTempKurs(e.target.value)}
                    className="w-16 bg-slate-700 text-white px-1 text-xs rounded border border-slate-500"
                  />
                  <button onClick={updateKurs} className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded text-white font-bold">OK</button>
                </div>
              ) : (
                <button onClick={() => setEditingKurs(true)} className="flex items-center gap-1 hover:text-emerald-400">
                  <span className="text-xs font-bold text-emerald-400">Rp {kursRate.toLocaleString('id-ID')}</span>
                  <Edit2 className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
            <p className="text-[9px] text-slate-400">Klik angka untuk ubah kurs</p>
          </div>
        </div>
      </header>

      {/* Konten Halaman */}
      <main className="p-4 space-y-5">
        {/* TAB DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Alert Pembayaran Belum Lunas */}
            {unpaidAlerts.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Peringatan Pembayaran Mendekati Tenggat!</span>
                </div>
                <div className="space-y-1">
                  {unpaidAlerts.map(p => (
                    <div key={p.id} className="text-xs flex justify-between text-amber-900">
                      <span>{p.kategori_tahun} - {p.nama_tagihan}</span>
                      <span className="font-semibold">{formatYuan(p.jumlah_yuan)} (Tenggat: {p.tenggat_waktu})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card Ringkasan Bulan Ini */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-lg space-y-3">
              <div className="flex justify-between items-center border-b border-indigo-800/60 pb-2">
                <span className="text-xs text-indigo-200">Rekap Bulan Ini</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-indigo-950 text-xs text-indigo-100 border border-indigo-700 rounded px-2 py-0.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> Pemasukan</p>
                  <p className="text-sm font-bold text-emerald-300">{formatYuan(monthIncomeYuan)}</p>
                  <p className="text-[10px] text-slate-400">{formatIDR(monthIncomeYuan)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-400 flex items-center gap-1"><ArrowDownRight className="w-3 h-3"/> Pengeluaran</p>
                  <p className="text-sm font-bold text-rose-300">{formatYuan(monthExpenseYuan)}</p>
                  <p className="text-[10px] text-slate-400">{formatIDR(monthExpenseYuan)}</p>
                </div>
              </div>
            </div>

            {/* Agenda Terbaru */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-indigo-600"/> Agenda Kuliah Mendatang</h2>
                <button onClick={() => setActiveTab('kuliah')} className="text-[11px] text-indigo-600 font-semibold">Lihat Semua</button>
              </div>
              <div className="space-y-2">
                {events.slice(0, 2).map(ev => (
                  <div key={ev.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold">{ev.judul}</p>
                      <p className="text-[10px] text-slate-500">📅 {ev.tanggal} • ⏰ {ev.jam}</p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada agenda terdaftar.</p>}
              </div>
            </div>

            {/* Mutasi Terakhir */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600"/> Mutasi Terakhir</h2>
              <div className="space-y-2">
                {transactions.slice(0, 3).map(t => (
                  <div key={t.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <p className="font-semibold">{t.keterangan || t.kategori}</p>
                      <p className="text-[10px] text-slate-400">{t.tanggal} • {t.kategori}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="space-y-4">
            <form onSubmit={addTransaction} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Catat Transaksi Baru</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pengeluaran' })}
                  className={`py-1.5 rounded-xl text-xs font-semibold border ${financeForm.tipe === 'pengeluaran' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-600'}`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFinanceForm({ ...financeForm, tipe: 'pemasukan' })}
                  className={`py-1.5 rounded-xl text-xs font-semibold border ${financeForm.tipe === 'pemasukan' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-600'}`}
                >
                  Pemasukan
                </button>
              </div>

              {financeForm.tipe === 'pengeluaran' && (
                <select
                  value={financeForm.kategori}
                  onChange={(e) => setFinanceForm({ ...financeForm, kategori: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                >
                  {['Makan', 'Minum', 'Kuota', 'Jajan', 'Belanja', 'Transportasi', 'Lain-lain'].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              )}

              <div className="space-y-1">
                <input
                  type="number"
                  step="any"
                  placeholder="Nominal (¥ Yuan)"
                  value={financeForm.nominalYuan}
                  onChange={(e) => setFinanceForm({ ...financeForm, nominalYuan: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                  required
                />
                {financeForm.nominalYuan && (
                  <p className="text-[10px] text-slate-500 pl-1">Prakiraan: {formatIDR(financeForm.nominalYuan)}</p>
                )}
              </div>

              <input
                type="date"
                value={financeForm.tanggal}
                onChange={(e) => setFinanceForm({ ...financeForm, tanggal: e.target.value })}
                className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
              />

              <input
                type="text"
                placeholder="Keterangan (misal: Beli makan)"
                value={financeForm.keterangan}
                onChange={(e) => setFinanceForm({ ...financeForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
              />

              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700">
                Simpan Transaksi
              </button>
            </form>

            {/* Mutasi Bank List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Riwayat Mutasi Transaksi</h2>
              <div className="space-y-2">
                {transactions.map(t => (
                  <div key={t.id} className="p-3 border-b border-slate-100 flex justify-between items-center last:border-none">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{t.keterangan || t.kategori}</p>
                      <p className="text-[10px] text-slate-400">{t.tanggal} • <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{t.kategori}</span></p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xs ${t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.tipe === 'pemasukan' ? '+' : '-'} {formatYuan(t.nominal_yuan)}
                      </p>
                      <p className="text-[9px] text-slate-400">{formatIDR(t.nominal_yuan)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB KULIAH */}
        {activeTab === 'kuliah' && (
          <div className="space-y-4">
            <form onSubmit={addAgenda} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Input Tugas / Event</h2>
              <input
                type="text"
                placeholder="Judul Tugas atau Event"
                value={agendaForm.judul}
                onChange={(e) => setAgendaForm({ ...agendaForm, judul: e.target.value })}
                className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={agendaForm.tanggal}
                  onChange={(e) => setAgendaForm({ ...agendaForm, tanggal: e.target.value })}
                  className="border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                />
                <input
                  type="time"
                  value={agendaForm.jam}
                  onChange={(e) => setAgendaForm({ ...agendaForm, jam: e.target.value })}
                  className="border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
                />
              </div>
              <textarea
                placeholder="Keterangan tambahan..."
                value={agendaForm.keterangan}
                onChange={(e) => setAgendaForm({ ...agendaForm, keterangan: e.target.value })}
                className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50"
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md">
                Tambah Agenda
              </button>
            </form>

            {/* List Agenda */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-bold text-xs text-slate-700">Daftar Agenda Kuliah</h2>
              <div className="space-y-2">
                {events.map(ev => (
                  <div key={ev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-xs text-slate-800">{ev.judul}</p>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{ev.jam}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">📅 {ev.tanggal}</p>
                    {ev.keterangan && <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 mt-1">{ev.keterangan}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB PEMBAYARAN KULIAH */}
        {activeTab === 'pembayaran' && (
          <div className="space-y-4">
            {/* Rekapitulasi Pembayaran */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-lg space-y-2">
              <span className="text-xs text-indigo-300">Total Biaya Kuliah</span>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-emerald-400">Sudah Dibayar</p>
                  <p className="text-sm font-bold text-emerald-300">{formatYuan(paidPaymentYuan)}</p>
                  <p className="text-[9px] text-slate-400">{formatIDR(paidPaymentYuan)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-400">Belum Dibayar</p>
                  <p className="text-sm font-bold text-rose-300">{formatYuan(unpaidPaymentYuan)}</p>
                  <p className="text-[9px] text-slate-400">{formatIDR(unpaidPaymentYuan)}</p>
                </div>
              </div>
            </div>

            {/* Filter Tahun */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {['Tahun Bahasa', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4'].map(thn => (
                <button
                  key={thn}
                  onClick={() => setSelectedPaymentYear(thn)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border ${selectedPaymentYear === thn ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {thn}
                </button>
              ))}
            </div>

            {/* Tabel Rincian Biaya */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between">
                <span>Rincian Biaya - {selectedPaymentYear}</span>
              </div>
              {payments.filter(p => p.kategori_tahun === selectedPaymentYear).map(item => (
                <div key={item.id} className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{item.nama_tagihan}</p>
                      <p className="text-xs font-semibold text-indigo-600">{formatYuan(item.jumlah_yuan)}</p>
                      <p className="text-[10px] text-slate-400">Estimasi: {formatIDR(item.jumlah_yuan)}</p>
                    </div>
                    <button
                      onClick={() => togglePaymentStatus(item.id, item.sudah_dibayar)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${item.sudah_dibayar ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {item.sudah_dibayar ? '✓ Lunas' : 'Belum Dibayar'}
                    </button>
                  </div>

                  {/* Input / Display Tenggat Waktu */}
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
                        <button onClick={() => saveDueDate(item.id)} className="bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">Simpan</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingDueDateId(item.id); setTempDueDate(item.tenggat_waktu || ''); }} className="font-semibold text-indigo-600 flex items-center gap-1">
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
      </main>

      {/* Navigation Bar Mobile Bawah */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Utama</span>
        </button>

        <button
          onClick={() => setActiveTab('keuangan')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${activeTab === 'keuangan' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Wallet className="w-5 h-5" />
          <span>Keuangan</span>
        </button>

        <button
          onClick={() => setActiveTab('kuliah')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${activeTab === 'kuliah' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Kuliah</span>
        </button>

        <button
          onClick={() => setActiveTab('pembayaran')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${activeTab === 'pembayaran' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Pembayaran</span>
        </button>
      </nav>
    </div>
  );
}
