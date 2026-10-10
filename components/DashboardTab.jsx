import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Banknote, 
  CalendarDays, 
  CheckSquare, 
  BookOpen, 
  ArrowRight, 
  MapPin, 
  Sparkles,
  PieChart
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// DAFTAR WAKTU UTAMA UNTUK MENGONVERSI JAM KE DENGAN MENTIMING TEPAT
const TIME_SLOTS_MAP = {
  1: '08:00', 2: '09:40', 3: '09:50', 4: '11:30',
  5: '14:00', 6: '15:40', 7: '15:50', 8: '17:30',
  9: '19:30', 10: '21:10', 11: '21:20', 12: '23:00'
};

const getWaktuFromJamArray = (jamArr) => {
  if (!Array.isArray(jamArr) || jamArr.length === 0) return '';
  const minJam = Math.min(...jamArr);
  const maxJam = Math.max(...jamArr);

  const startMap = {
    1: '08:00', 2: '08:55', 3: '09:50', 4: '10:45',
    5: '14:00', 6: '14:55', 7: '15:50', 8: '16:45',
    9: '19:30', 10: '20:25', 11: '21:20', 12: '22:15'
  };

  const endMap = {
    1: '08:45', 2: '09:40', 3: '10:35', 4: '11:30',
    5: '14:45', 6: '15:40', 7: '16:35', 8: '17:30',
    9: '20:15', 10: '21:10', 11: '22:05', 12: '23:00'
  };

  return `${startMap[minJam] || ''} - ${endMap[maxJam] || ''}`;
};

export default function DashboardTab({ transactions = [], kursYuan = 2671, setActiveTab }) {
  // Realtime Clock State
  const [time, setTime] = useState(new Date());

  // Supabase Data States
  const [agendas, setAgendas] = useState([]);
  const [todos, setTodos] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  // Tools Quick Note State
  const [quickNote, setQuickNote] = useState('');

  // 1. REALTIME CLOCK EFFECT
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. FETCH SUPABASE DATA (AGENDA, TODOS, JADWAL)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch Agendas (Max 5 Terdekat)
        const { data: agendaData } = await supabase
          .from('agenda_kuliah')
          .select('*')
          .gte('tanggal', todayStr)
          .order('tanggal', { ascending: true })
          .limit(5);

        if (agendaData) setAgendas(agendaData);

        // Fetch Todos (Belum Selesai, Max 5 Terdekat)
        const { data: todoData } = await supabase
          .from('todo_tugas')
          .select('*')
          .eq('selesai', false)
          .order('tenggat_waktu', { ascending: true, nullsFirst: false })
          .limit(5);

        if (todoData) setTodos(todoData);

        // Fetch Jadwal Kuliah Hari Ini
        const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const currentDayIndo = daysIndo[new Date().getDay()];

        const { data: jadwalData } = await supabase
          .from('jadwal_kuliah')
          .select('*')
          .eq('hari', currentDayIndo);

        if (jadwalData) setTodaySchedule(jadwalData);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err.message);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper Formatting
  const formatYuan = (val) => `¥${Number(val || 0).toLocaleString('de-DE')}`;
  const formatIDR = (valYuan) =>
    `Rp ${(Number(valYuan || 0) * kursYuan).toLocaleString('id-ID')}`;

  // Keuangan Calculations
  const currentMonth = time.getMonth();
  const currentYear = time.getFullYear();

  let totalTunai = 0;
  let totalBank = 0;
  let totalPemasukanBulanIni = 0;
  let totalPengeluaranBulanIni = 0;

  const categoryTotals = {};

  transactions.forEach((tx) => {
    const nominal = Number(tx.nominal_yuan) || 0;
    
    // Total Saldo
    if (tx.tipe === 'pemasukan') {
      if (tx.metode === 'Tunai') totalTunai += nominal;
      if (tx.metode === 'Bank') totalBank += nominal;
    } else {
      if (tx.metode === 'Tunai') totalTunai -= nominal;
      if (tx.metode === 'Bank') totalBank -= nominal;
    }

    // Calculation Bulan Ini
    if (tx.tanggal) {
      const d = new Date(tx.tanggal);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (tx.tipe === 'pemasukan') {
          totalPemasukanBulanIni += nominal;
        } else {
          totalPengeluaranBulanIni += nominal;
          const kat = tx.kategori || 'Lain-lain';
          categoryTotals[kat] = (categoryTotals[kat] || 0) + nominal;
        }
      }
    }
  });

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="space-y-6">
      
      {/* BARIS 1: KOTAK BIRU TUA (JAM) & KOTAK MERAH (KEUANGAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOTAK BIRU TUA: JAM & TANGGAL REALTIME */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> WAKTU REALTIME
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
              LIVE
            </span>
          </div>

          <div className="py-6 text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-widest font-mono">
              {formattedTime}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {formattedDate}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <span>Status Sistem:</span>
            <span className="text-indigo-300 font-extrabold">Terhubung ke Supabase</span>
          </div>
        </div>

        {/* KOTAK MERAH: REKAPAN KEUANGAN & RINCIAN PER KATEGORI */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                REKAPAN KEUANGAN
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('keuangan')}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Rincian Keuangan <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* TOTAL KEUANGAN (4 STATUS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                <Banknote className="w-3 h-3 text-amber-400" /> Tunai
              </span>
              <p className="text-sm font-black text-white">{formatYuan(totalTunai)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalTunai)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" /> Bank
              </span>
              <p className="text-sm font-black text-white">{formatYuan(totalBank)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalBank)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Pemasukan
              </span>
              <p className="text-sm font-black text-emerald-400">+{formatYuan(totalPemasukanBulanIni)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalPemasukanBulanIni)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Pengeluaran
              </span>
              <p className="text-sm font-black text-rose-400">-{formatYuan(totalPengeluaranBulanIni)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalPengeluaranBulanIni)}</p>
            </div>
          </div>

          {/* KOTAK HIJAU TUA: PENGELUARAN PER KATEGORI */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
              TOTAL PENGELUARAN PER KATEGORI (BULAN INI)
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(categoryTotals).length === 0 ? (
                <span className="text-xs text-slate-500 italic">Belum ada pengeluaran bulan ini.</span>
              ) : (
                Object.entries(categoryTotals).map(([kat, val]) => (
                  <div
                    key={kat}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2 text-xs"
                  >
                    <span className="font-bold text-slate-300">{kat}:</span>
                    <span className="font-black text-emerald-400">{formatYuan(val)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* BARIS 2: 2 KOTAK MAROON (50%) & KOTAK KUNING JADWAL (50%) SEIMBANG DI TENGAH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* KIRI (50%): 2 KOTAK MAROON (AGENDA & TODO) */}
        <div className="flex flex-col justify-between gap-6">
          
          {/* MAROON 1: AGENDA KULIAH MENDATANG */}
          <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-2.5 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-rose-400" /> AGENDA MENDATANG (MAX 5)
                </span>
                <button
                  onClick={() => setActiveTab('agenda')}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-2">
                {agendas.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">Tidak ada agenda mendatang.</p>
                ) : (
                  agendas.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate max-w-[200px]">
                        {item.judul || item.acara}
                      </span>
                      <span className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                        {item.tanggal}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MAROON 2: TODO TUGAS TERDEKAT */}
          <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-2.5 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-rose-400" /> TODO TUGAS TERDEKAT (MAX 5)
                </span>
                <button
                  onClick={() => setActiveTab('tugas')}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-2">
                {todos.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">Tidak ada tugas terdekat.</p>
                ) : (
                  todos.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white truncate max-w-[200px]">
                        {item.judul}
                      </span>
                      <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {item.tenggat_waktu || 'Tidak ada tenggat'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* KANAN (50%): KOTAK KUNING (JADWAL KULIAH HARI INI DENGAN RENTANG JAM) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  JADWAL KULIAH HARI INI
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('jadwal')}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                Atur Jadwal <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {todaySchedule.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500">Tidak ada jadwal kuliah untuk hari ini.</p>
                </div>
              ) : (
                todaySchedule.map((item) => {
                  const waktuStr = getWaktuFromJamArray(item.kategori_jam);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white block">
                          {item.matkul}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" /> {item.tempat}
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl inline-block">
                          Jam Ke: {Array.isArray(item.kategori_jam) ? item.kategori_jam.join(', ') : '-'}
                        </span>
                        {waktuStr && (
                          <span className="text-[10px] text-slate-400 font-bold block flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> {waktuStr}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-500 text-right italic border-t border-slate-800/80 mt-4">
            *Menampilkan jadwal otomatis berdasarkan hari saat ini.
          </div>
        </div>

      </div>

      {/* BARIS 3: PERSENTASE PENGELUARAN REALTIME (TANPA INFINITE SPINNER) & MINI TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KIRI (PURPLE): RINCIAN PERSENTASE PENGELUARAN FIX */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                PERSENTASE PENGELUARAN PER KATEGORI
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {totalPengeluaranBulanIni === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Belum ada data pengeluaran bulan ini.
              </p>
            ) : (
              Object.entries(categoryTotals).map(([kat, val]) => {
                const percent = Math.round((val / totalPengeluaranBulanIni) * 100);
                return (
                  <div key={kat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{kat}</span>
                      <span className="text-purple-400">{percent}% ({formatYuan(val)})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KANAN (ABU-ABU): MINI TOOLS DENGAN CATATAN CEPAT */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-300" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                CATATAN CEPAT & MINI TOOLS
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tools')}
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
            >
              Buka Tools <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <textarea
            rows="3"
            placeholder="Ketik catatan cepat di sini..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

      </div>

    </div>
  );
}
