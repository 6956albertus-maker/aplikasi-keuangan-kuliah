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
  TrendingUp as LineChartIcon,
  Target,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const END_TIMES_MAP = {
  1: '08:45', 2: '09:35', 3: '10:35', 4: '11:25',
  5: '14:45', 6: '15:35', 7: '16:35', 8: '17:25',
  9: '20:15', 10: '21:05', 11: '22:05', 12: '22:55'
};

const INITIAL_FIXED_SCHEDULE = {
  Senin: [
    { id: 'fixed-s1', matkul: 'Chinese Comprehensive Course', tempat: 'Gedung 2 Ruangan 1-2', jam: [3, 4], active: true },
    { id: 'fixed-s2', matkul: 'Chinese Listening Course', tempat: 'Gedung 2 Ruangan 111', jam: [5, 6], active: true },
    { id: 'fixed-s3', matkul: 'Chinese Speaking Course', tempat: 'Gedung 2 Ruangan 209', jam: [7, 8], active: true },
  ],
  Selasa: [
    { id: 'fixed-se1', matkul: 'Chinese Comprehensive Course', tempat: 'Gedung 2 Ruangan 303', jam: [3, 4], active: true },
    { id: 'fixed-se2', matkul: 'Chinese Reading and Writing Course', tempat: 'Gedung 2 Ruangan 111', jam: [5, 6], active: true },
  ],
  Rabu: [
    { id: 'fixed-r1', matkul: 'Chinese Culture Course', tempat: 'Gedung 2 Ruangan 2-1', jam: [1, 2], active: true },
    { id: 'fixed-r2', matkul: 'Chinese Reading and Writing Course', tempat: 'Gedung 2 Ruangan 111', jam: [3, 4], active: true },
  ],
  Kamis: [
    { id: 'fixed-k1', matkul: 'Chinese Speaking Course', tempat: 'Gedung 2 Ruangan 307', jam: [1, 2], active: true },
    { id: 'fixed-k2', matkul: 'Chinese Listening Course', tempat: 'Gedung Teaching Ruangan 1-2', jam: [3, 4], active: true },
  ],
  Jumat: [
    { id: 'fixed-j1', matkul: 'Chinese Culture Course', tempat: 'Gedung 2 Ruangan 203', jam: [3, 4], active: true },
  ],
  Sabtu: [],
  Minggu: []
};

const getWaktuFromJamArray = (jamArr) => {
  if (!Array.isArray(jamArr) || jamArr.length === 0) return '';
  const minJam = Math.min(...jamArr);
  const maxJam = Math.max(...jamArr);

  const startMap = {
    1: '08:00', 2: '08:50', 3: '09:50', 4: '10:40',
    5: '14:00', 6: '14:50', 7: '15:50', 8: '16:40',
    9: '19:30', 10: '20:20', 11: '21:20', 12: '22:10'
  };

  return `${startMap[minJam] || ''} - ${END_TIMES_MAP[maxJam] || ''}`;
};

const sortScheduleByJam = (scheduleList) => {
  if (!Array.isArray(scheduleList)) return [];
  return [...scheduleList].sort((a, b) => {
    const minA = Array.isArray(a.kategori_jam) && a.kategori_jam.length > 0 ? Math.min(...a.kategori_jam) : 99;
    const minB = Array.isArray(b.kategori_jam) && b.kategori_jam.length > 0 ? Math.min(...b.kategori_jam) : 99;
    return minA - minB;
  });
};

const getCalculatedCollegeWeek = (semesterStartDateStr) => {
  const startDate = new Date(semesterStartDateStr || '2026-09-01');
  const today = new Date();
  const diffTime = Math.max(0, today - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

export default function DashboardTab({ transactions = [], kursYuan = 2694, setActiveTab }) {
  const [time, setTime] = useState(new Date());

  const [agendas, setAgendas] = useState([]);
  const [todos, setTodos] = useState([]);
  const [displayedSchedule, setDisplayedSchedule] = useState([]);
  const [isScheduleTomorrow, setIsScheduleTomorrow] = useState(false);
  const [currentCollegeWeek, setCurrentCollegeWeek] = useState(1);

  const [quickNote, setQuickNote] = useState('');

  const TARGET_ANGGARAN_BULANAN = 1100;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // SINKRONISASI JADWAL UTAMA SINKRON DENGAN JADWAL TAB (TETAP + TAMBAHAN + CHIPS)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch Agendas
        const { data: agendaData } = await supabase
          .from('agenda_kuliah')
          .select('*')
          .gte('tanggal', todayStr)
          .order('tanggal', { ascending: true })
          .limit(5);

        if (agendaData) setAgendas(agendaData);

        // Fetch Todos
        const { data: todoData } = await supabase
          .from('todo_tugas')
          .select('*')
          .eq('selesai', false)
          .order('tenggat_waktu', { ascending: true, nullsFirst: false })
          .limit(5);

        if (todoData) setTodos(todoData);

        // Fetch Start Date untuk Minggu Kuliah
        let startDateStr = '2026-09-01';
        const { data: setStart } = await supabase
          .from('pengaturan')
          .select('value')
          .eq('key', 'semester_start_str')
          .single();

        if (setStart && setStart.value) startDateStr = setStart.value;

        const currentWeekNum = getCalculatedCollegeWeek(startDateStr);
        setCurrentCollegeWeek(currentWeekNum);

        // Read Smart Chips
        const savedChips = localStorage.getItem(`fixed_schedule_week_${currentWeekNum}`);
        let activeFixedSchedule = INITIAL_FIXED_SCHEDULE;
        if (savedChips) {
          try { activeFixedSchedule = JSON.parse(savedChips); } catch (e) {}
        }

        // Fetch Additional Schedule
        const { data: dbAdditional } = await supabase.from('jadwal_kuliah').select('*');
        const additionalList = dbAdditional || [];

        // Determinasi Hari Ini & Besok
        const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const now = new Date();
        const currentDayIndex = now.getDay();
        const todayDayName = daysIndo[currentDayIndex];
        const tomorrowDayName = daysIndo[(currentDayIndex + 1) % 7];

        // Helper gabung jadwal tetap + tambahan
        const getMergedScheduleForDay = (dayName) => {
          const fixedForDay = (activeFixedSchedule[dayName] || [])
            .filter((item) => item.active)
            .map((item) => ({
              id: item.id,
              matkul: item.matkul,
              tempat: item.tempat,
              kategori_jam: item.jam
            }));

          const additionalForDay = additionalList
            .filter((item) => item.hari === dayName && (Number(item.minggu) === Number(currentWeekNum) || !item.minggu))
            .map((item) => ({
              id: item.id,
              matkul: item.matkul,
              tempat: item.tempat,
              kategori_jam: Array.isArray(item.kategori_jam) ? item.kategori_jam : []
            }));

          return sortScheduleByJam([...fixedForDay, ...additionalForDay]);
        };

        const todayCombinedSchedule = getMergedScheduleForDay(todayDayName);

        let isAllFinished = false;
        if (todayCombinedSchedule.length > 0) {
          let maxEndJam = 0;
          todayCombinedSchedule.forEach((item) => {
            if (Array.isArray(item.kategori_jam) && item.kategori_jam.length > 0) {
              const localMax = Math.max(...item.kategori_jam);
              if (localMax > maxEndJam) maxEndJam = localMax;
            }
          });

          if (maxEndJam > 0 && END_TIMES_MAP[maxEndJam]) {
            const [endHour, endMin] = END_TIMES_MAP[maxEndJam].split(':').map(Number);
            const endObj = new Date();
            endObj.setHours(endHour, endMin, 0, 0);

            if (now > endObj) {
              isAllFinished = true;
            }
          }
        } else {
          isAllFinished = true;
        }

        if (isAllFinished) {
          const tomorrowCombinedSchedule = getMergedScheduleForDay(tomorrowDayName);
          setDisplayedSchedule(tomorrowCombinedSchedule);
          setIsScheduleTomorrow(true);
        } else {
          setDisplayedSchedule(todayCombinedSchedule);
          setIsScheduleTomorrow(false);
        }

      } catch (err) {
        console.error('Error fetching dashboard summary:', err.message);
      }
    };

    fetchDashboardData();
  }, []);

  const formatYuan = (val) => `¥${Number(val || 0).toLocaleString('de-DE')}`;
  const formatIDR = (valYuan) =>
    `Rp ${(Number(valYuan || 0) * kursYuan).toLocaleString('id-ID')}`;

  const currentMonth = time.getMonth();
  const currentYear = time.getFullYear();

  let totalTunai = 0;
  let totalBank = 0;
  let totalPemasukanBulanIni = 0;
  let totalPengeluaranBulanIni = 0;
  let totalPengeluaranNonKuliah = 0;

  const categoryTotals = {};

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyIncome = new Array(daysInMonth).fill(0);
  const dailyExpenseNonKuliah = new Array(daysInMonth).fill(0);

  transactions.forEach((tx) => {
    const nominal = Number(tx.nominal_yuan) || 0;
    
    if (tx.tipe === 'pemasukan') {
      if (tx.metode === 'Tunai') totalTunai += nominal;
      if (tx.metode === 'Bank') totalBank += nominal;
    } else {
      if (tx.metode === 'Tunai') totalTunai -= nominal;
      if (tx.metode === 'Bank') totalBank -= nominal;
    }

    if (tx.tanggal) {
      const d = new Date(tx.tanggal);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dayNum = d.getDate() - 1;

        if (tx.tipe === 'pemasukan') {
          totalPemasukanBulanIni += nominal;
          if (dayNum >= 0 && dayNum < daysInMonth) {
            dailyIncome[dayNum] += nominal;
          }
        } else {
          totalPengeluaranBulanIni += nominal;
          const kat = tx.kategori || 'Lain-lain';
          categoryTotals[kat] = (categoryTotals[kat] || 0) + nominal;

          if (kat.toLowerCase() !== 'biaya kuliah') {
            totalPengeluaranNonKuliah += nominal;
            if (dayNum >= 0 && dayNum < daysInMonth) {
              dailyExpenseNonKuliah[dayNum] += nominal;
            }
          }
        }
      }
    }
  });

  const targetPercent = Math.min(
    100,
    Math.round((totalPengeluaranNonKuliah / TARGET_ANGGARAN_BULANAN) * 100)
  );

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const formattedTimeWithTZ = `${hours}:${minutes}:${seconds} +CST`;

  const maxValGraph = Math.max(...dailyIncome, ...dailyExpenseNonKuliah, 100);
  const graphWidth = 500;
  const graphHeight = 120;

  const getPoints = (dataArr) => {
    return dataArr.map((val, idx) => {
      const x = (idx / (daysInMonth - 1)) * graphWidth;
      const y = graphHeight - (val / maxValGraph) * (graphHeight - 20) - 10;
      return `${x},${y}`;
    }).join(' ');
  };

  const incomePointsStr = getPoints(dailyIncome);
  const expensePointsStr = getPoints(dailyExpenseNonKuliah);

  return (
    <div className="space-y-6">
      
      {/* BARIS 1: WAKTU REALTIME & REKAPAN KEUANGAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono">
              {formattedTimeWithTZ}
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

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                <Banknote className="w-3 h-3 text-amber-400" /> Tunai
              </span>
              <p className="text-xs font-black text-white">{formatYuan(totalTunai)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalTunai)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" /> Bank
              </span>
              <p className="text-xs font-black text-white">{formatYuan(totalBank)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalBank)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Pemasukan
              </span>
              <p className="text-xs font-black text-emerald-400">+{formatYuan(totalPemasukanBulanIni)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalPemasukanBulanIni)}</p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Total Keluar
              </span>
              <p className="text-xs font-black text-rose-400">-{formatYuan(totalPengeluaranBulanIni)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalPengeluaranBulanIni)}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <span className="text-[10px] font-extrabold text-purple-300 uppercase block mb-1 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-purple-400" /> Excl. Kuliah
              </span>
              <p className="text-xs font-black text-purple-300">{formatYuan(totalPengeluaranNonKuliah)}</p>
              <p className="text-[9px] text-slate-500">{formatIDR(totalPengeluaranNonKuliah)}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-black text-purple-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" /> TARGET ANGGARAN RUTIN BULANAN (EXCL. BIAYA KULIAH)
              </span>
              <span className="font-mono font-bold text-purple-200">
                {formatYuan(totalPengeluaranNonKuliah)} / <span className="text-purple-400">¥1.100</span> ({targetPercent}%)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/80">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  targetPercent >= 100
                    ? 'bg-rose-500'
                    : targetPercent >= 80
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${targetPercent}%` }}
              />
            </div>
          </div>

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

      {/* BARIS 2: AGENDA, TODO & JADWAL KULIAH (SINKRON DENGAN CHIPS + MINGGU) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        <div className="flex flex-col justify-between gap-6">
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

        {/* JADWAL KULIAH DASHBOARD */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  {isScheduleTomorrow ? 'JADWAL KULIAH BESOK' : 'JADWAL KULIAH HARI INI'}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Minggu Ke-{currentCollegeWeek}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('jadwal')}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                Atur Jadwal <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {displayedSchedule.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500">
                    {isScheduleTomorrow
                      ? 'Tidak ada jadwal kuliah untuk besok.'
                      : 'Tidak ada jadwal kuliah untuk hari ini.'}
                  </p>
                </div>
              ) : (
                displayedSchedule.map((item) => {
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
            {isScheduleTomorrow
              ? '*Kelas hari ini telah selesai, menampilkan jadwal esok hari.'
              : '*Menampilkan jadwal aktif berdasarkan hari saat ini.'}
          </div>
        </div>

      </div>

      {/* BARIS 3: GRAFIK GARIS TREN KEUANGAN & CATATAN CEPAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                GRAFIK TREN KEUANGAN BULAN INI (EKSKLUSIF BIAYA KULIAH)
              </h3>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-300">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="text-slate-300">Pengeluaran Harian (Di Luar Biaya Kuliah)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-36 overflow-visible">
                <line x1="0" y1="20" x2={graphWidth} y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="60" x2={graphWidth} y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="100" x2={graphWidth} y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={incomePointsStr}
                />

                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={expensePointsStr}
                />
              </svg>

              <div className="flex justify-between text-[9px] text-slate-500 font-bold pt-2 border-t border-slate-800/60 mt-1">
                <span>Tgl 1</span>
                <span>Tgl {Math.floor(daysInMonth / 2)}</span>
                <span>Tgl {daysInMonth}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 block">Total Pemasukan:</span>
                <span className="font-black text-emerald-400">{formatYuan(totalPemasukanBulanIni)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 block">Pengeluaran (Non-Kuliah):</span>
                <span className="font-black text-rose-400">{formatYuan(totalPengeluaranNonKuliah)}</span>
              </div>
            </div>
          </div>
        </div>

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
            rows="6"
            placeholder="Ketik catatan cepat di sini..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

      </div>

    </div>
  );
}
