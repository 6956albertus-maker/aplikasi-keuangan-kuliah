import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CheckSquare, 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function DashboardTab({ transactions = [], kursYuan = 2671, setActiveTab }) {
  const [todoSummary, setTodoSummary] = useState({ total: 0, selesai: 0, belum: 0 });
  const [upcomingAgendas, setUpcomingAgendas] = useState([]);

  // Format Helper
  const formatYuan = (val) => `¥${Number(val || 0).toLocaleString('de-DE')}`;
  const formatIDR = (valYuan) =>
    `Rp ${(Number(valYuan || 0) * kursYuan).toLocaleString('id-ID')}`;

  // Perhitungan Keuangan Bulan Ini
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let totalPemasukanBulanIni = 0;
  let totalPengeluaranBulanIni = 0;

  transactions.forEach((tx) => {
    if (!tx.tanggal) return;
    const d = new Date(tx.tanggal);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const val = Number(tx.nominal_yuan) || 0;
      if (tx.tipe === 'pemasukan') totalPemasukanBulanIni += val;
      else totalPengeluaranBulanIni += val;
    }
  });

  // Fetch Todo & Agenda Summary dari Supabase
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        // Fetch Summary Todo
        const { data: todos } = await supabase.from('todo_tugas').select('*');
        if (todos) {
          const total = todos.length;
          const selesai = todos.filter((t) => t.selesai).length;
          setTodoSummary({ total, selesai, belum: total - selesai });
        }

        // Fetch Agenda Mendatang
        const today = new Date().toISOString().split('T')[0];
        const { data: agendas } = await supabase
          .from('agenda_kuliah')
          .select('*')
          .gte('tanggal', today)
          .order('tanggal', { ascending: true })
          .limit(4);

        if (agendas) {
          setUpcomingAgendas(agendas);
        }
      } catch (err) {
        console.error('Gagal mengambil data summary:', err.message);
      }
    };

    fetchSummaryData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REKAPAN KEUANGAN */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Rekapan Keuangan
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('keuangan')}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Detail <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400 font-medium">Pemasukan (Bulan Ini)</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">
                  +{formatYuan(totalPemasukanBulanIni)}
                </p>
                <p className="text-[10px] text-slate-500">{formatIDR(totalPemasukanBulanIni)}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-slate-400 font-medium">Pengeluaran (Bulan Ini)</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-rose-400">
                  -{formatYuan(totalPengeluaranBulanIni)}
                </p>
                <p className="text-[10px] text-slate-500">{formatIDR(totalPengeluaranBulanIni)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* REKAPAN TODO TUGAS */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Status Todo Tugas
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tugas')}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Detail <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400">Tugas Selesai</span>
              <p className="text-2xl font-black text-emerald-400">{todoSummary.selesai}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-400">Belum Selesai</span>
              <p className="text-2xl font-black text-amber-400">{todoSummary.belum}</p>
            </div>
          </div>
        </div>

        {/* REKAPAN AGENDA KULIAH */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Agenda Mendatang
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('agenda')}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Detail <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {upcomingAgendas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Tidak ada agenda terdekat.</p>
            ) : (
              upcomingAgendas.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-white truncate max-w-[150px]">
                    {item.judul || item.acara}
                  </span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.tanggal}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
