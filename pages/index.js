import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import { useTransactions } from '../hooks/useTransactions';

import DashboardTab from '../components/DashboardTab';
import KeuanganTab from '../components/KeuanganTab';
import PaymentTab from '../components/PaymentTab';
import TodoTugasTab from '../components/TodoTugasTab';
import AgendaKuliahTab from '../components/AgendaKuliahTab';
import JadwalKuliahTab from '../components/JadwalKuliahTab';
import ToolsTab from '../components/ToolsTab';

import { 
  Wallet, 
  CheckSquare, 
  CalendarDays, 
  GraduationCap, 
  Wrench, 
  LayoutDashboard,
  Coins,
  BookOpen,
  Edit2,
  Check
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('summary');
  const [kursYuan, setKursYuan] = useState(2671);
  const [isEditingKurs, setIsEditingKurs] = useState(false);
  const [inputKursVal, setInputKursVal] = useState(2671);

  const {
    transactions,
    loading: loadingTx,
    addTransaction,
    editTransaction,
    deleteTransaction,
    resetTransactions,
  } = useTransactions();

  // FETCH KURS DARI SUPABASE
  useEffect(() => {
    const fetchKurs = async () => {
      try {
        const { data, error } = await supabase
          .from('pengaturan')
          .select('value')
          .eq('key', 'kurs_yuan')
          .single();

        if (error) throw error;
        if (data && data.value) {
          setKursYuan(Number(data.value));
          setInputKursVal(Number(data.value));
        }
      } catch (err) {
        console.error('Gagal mengambil kurs yuan:', err.message);
      }
    };
    fetchKurs();
  }, []);

  // UPDATE KURS KE SUPABASE
  const handleSaveKurs = async () => {
    const newVal = Number(inputKursVal);
    if (!newVal || newVal <= 0) return;

    setKursYuan(newVal);
    setIsEditingKurs(false);

    const { error } = await supabase
      .from('pengaturan')
      .upsert({ key: 'kurs_yuan', value: newVal });

    if (error) {
      console.error('Gagal memperbarui kurs ke Supabase:', error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Student Manager</title>
        <meta name="description" content="Dashboard Student Manager" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* HEADER DENGAN JUDUL & WIDGET KURS EDITABLE (TANPA KATA SUPABASE) */}
          <header className="relative flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 uppercase">
                STUDENT MANAGER
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Sistem Manajemen Keuangan, Tugas, dan Agenda Kuliah
              </p>
            </div>

            {/* WIDGET KURS EDITABLE */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-purple-500/30 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-md">
              <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  KURS YUAN
                </span>

                {isEditingKurs ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs font-bold text-white">1 CNY = Rp</span>
                    <input
                      type="number"
                      value={inputKursVal}
                      onChange={(e) => setInputKursVal(e.target.value)}
                      className="w-20 p-1 rounded-lg bg-slate-800 border border-purple-500 text-xs font-black text-emerald-400 text-center focus:outline-none"
                    />
                    <button
                      onClick={handleSaveKurs}
                      className="p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-emerald-400">
                      1 CNY = Rp {kursYuan.toLocaleString('id-ID')}
                    </p>
                    <button
                      onClick={() => setIsEditingKurs(true)}
                      className="p-1 text-slate-400 hover:text-purple-300 rounded-lg"
                      title="Edit Nilai Kurs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* NAVIGASI TOMBOL DASHBOARD CENTER */}
          <div className="flex justify-center">
            <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('jadwal')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'jadwal'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Jadwal Kuliah</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'keuangan'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Keuangan</span>
              </button>

              <button
                onClick={() => setActiveTab('pembayaran')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'pembayaran'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Pembayaran Kuliah</span>
              </button>

              <button
                onClick={() => setActiveTab('tugas')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'tugas'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Todo Tugas</span>
              </button>

              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'agenda'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Agenda Kuliah</span>
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'tools'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Tools</span>
              </button>
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <main>
            {activeTab === 'summary' && (
              <DashboardTab
                transactions={transactions}
                kursYuan={kursYuan}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'jadwal' && <JadwalKuliahTab />}

            {activeTab === 'keuangan' && (
              <KeuanganTab
                transactions={transactions}
                loading={loadingTx}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                resetTransactions={resetTransactions}
                kursYuan={kursYuan}
              />
            )}

            {activeTab === 'pembayaran' && <PaymentTab kursYuan={kursYuan} />}

            {activeTab === 'tugas' && <TodoTugasTab />}

            {activeTab === 'agenda' && <AgendaKuliahTab />}

            {activeTab === 'tools' && <ToolsTab kursYuan={kursYuan} />}
          </main>
        </div>
      </div>
    </>
  );
}
