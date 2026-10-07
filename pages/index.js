import React, { useState } from 'react';
import Head from 'next/head';
import { useTransactions } from '../hooks/useTransactions';
import KeuanganTab from '../components/KeuanganTab';
import PaymentTab from '../components/PaymentTab';
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
        <title>Aplikasi Keuangan Kuliah</title>
        <meta name="description" content="Aplikasi Pencatatan Keuangan Kuliah" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header & Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h1 className="text-xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Aplikasi Keuangan
            </h1>

            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('keuangan')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'keuangan'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Keuangan
              </button>
              <button
                onClick={() => setActiveTab('pembayaran')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'pembayaran'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pembayaran Kuliah
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'tools'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tools
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'keuangan' && (
            <KeuanganTab
              transactions={transactions}
              addTransaction={addTransaction}
              editTransaction={editTransaction}
              deleteTransaction={deleteTransaction}
              resetTransactions={resetTransactions}
            />
          )}

          {activeTab === 'pembayaran' && <PaymentTab />}

          {activeTab === 'tools' && <ToolsTab />}
        </div>
      </main>
    </>
  );
}
