import React, { useState } from 'react';
import Head from 'next/head';
import { useTransactions } from '../hooks/useTransactions';
import KeuanganTab from '../components/KeuanganTab';
import PaymentTab from '../components/PaymentTab';
import TodoTugasTab from '../components/TodoTugasTab';
import AgendaKuliahTab from '../components/AgendaKuliahTab';
import ToolsTab from '../components/ToolsTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('keuangan');

  const {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    resetTransactions,
  } = useTransactions();

  return (
    <>
      <Head>
        <title>Aplikasi Keuangan & Agenda Kuliah</title>
        <meta name="description" content="Aplikasi Keuangan, Pembayaran, Todo Tugas, dan Agenda Kuliah" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* HEADER DENGAN TOMBOL NAVIGASI TAB */}
          <header className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 uppercase">
                APLIKASI KEUANGAN & KULIAH
              </h1>
            </div>

            {/* NAVIGASI HEADER */}
            <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-xl">
              <button
                onClick={() => setActiveTab('keuangan')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'keuangan'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Keuangan
              </button>

              <button
                onClick={() => setActiveTab('pembayaran')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'pembayaran'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Pembayaran Kuliah
              </button>

              <button
                onClick={() => setActiveTab('tugas')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'tugas'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Todo Tugas
              </button>

              <button
                onClick={() => setActiveTab('agenda')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'agenda'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Agenda Kuliah
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'tools'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Tools
              </button>
            </nav>
          </header>

          {/* RENDERING KONTEN BERDASARKAN TAB AKTIF */}
          <main>
            {activeTab === 'keuangan' && (
              <KeuanganTab
                transactions={transactions}
                loading={loading}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                resetTransactions={resetTransactions}
              />
            )}

            {activeTab === 'pembayaran' && <PaymentTab />}

            {activeTab === 'tugas' && <TodoTugasTab />}

            {activeTab === 'agenda' && <AgendaKuliahTab />}

            {activeTab === 'tools' && <ToolsTab />}
          </main>
        </div>
      </div>
    </>
  );
}
