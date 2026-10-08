import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  GraduationCap, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils';

export default function PaymentTab() {
  // State pilihan tahun
  const [activeTab, setActiveTab] = useState('Tahun Bahasa');

  // State data pembayaran kuliah per tahun
  const [dataPembayaran, setDataPembayaran] = useState({
    'Tahun Bahasa': [
      { id: 1, nama: 'SPP / Tuition Fee', nominal: 15000, isLunas: true },
      { id: 2, nama: 'Asrama (Dormitory)', nominal: 4000, isLunas: true },
      { id: 3, nama: 'Asuransi Kesehatan', nominal: 800, isLunas: false },
    ],
    'Tahun 1': [
      { id: 4, nama: 'SPP / Tuition Fee', nominal: 18000, isLunas: false },
      { id: 5, nama: 'Asrama (Dormitory)', nominal: 4000, isLunas: false },
      { id: 6, nama: 'Buku & Peralatan', nominal: 1000, isLunas: false },
    ],
    'Tahun 2': [
      { id: 7, nama: 'SPP / Tuition Fee', nominal: 18000, isLunas: false },
      { id: 8, nama: 'Asrama (Dormitory)', nominal: 4000, isLunas: false },
    ],
    'Tahun 3': [
      { id: 9, nama: 'SPP / Tuition Fee', nominal: 18000, isLunas: false },
      { id: 10, nama: 'Asrama (Dormitory)', nominal: 4000, isLunas: false },
    ],
    'Tahun 4': [
      { id: 11, nama: 'SPP / Tuition Fee', nominal: 18000, isLunas: false },
      { id: 12, nama: 'Asrama (Dormitory)', nominal: 4000, isLunas: false },
      { id: 13, nama: 'Biaya Wisuda & Skripsi', nominal: 2500, isLunas: false },
    ],
  });

  // State Form Edit
  const [editingId, setEditingId] = useState(null);
  const [editNama, setEditNama] = useState('');
  const [editNominal, setEditNominal] = useState('');

  // State Form Tambah Tagihan Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNominal, setNewNominal] = useState('');

  const listTahun = ['Tahun Bahasa', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4'];

  // Hitung Total Keseluruhan (Semua Tahun)
  let totalLunas = 0;
  let totalBelumLunas = 0;

  Object.values(dataPembayaran).forEach((items) => {
    items.forEach((item) => {
      const val = Number(item.nominal) || 0;
      if (item.isLunas) {
        totalLunas += val;
      } else {
        totalBelumLunas += val;
      }
    });
  });

  // Toggle Checkbox Status Lunas
  const handleToggleLunas = (id) => {
    setDataPembayaran((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) =>
        item.id === id ? { ...item, isLunas: !item.isLunas } : item
      ),
    }));
  };

  // Mulai Mode Edit
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditNama(item.nama);
    setEditNominal(item.nominal);
  };

  // Simpan Hasil Edit
  const handleSaveEdit = (id) => {
    setDataPembayaran((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) =>
        item.id === id
          ? { ...item, nama: editNama, nominal: parseFloat(editNominal) || 0 }
          : item
      ),
    }));
    setEditingId(null);
  };

  // Hapus Item Tagihan
  const handleDeleteItem = (id) => {
    setDataPembayaran((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }));
  };

  // Tambah Item Tagihan Baru
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newNama || !newNominal) return;

    const newItem = {
      id: Date.now(),
      nama: newNama,
      nominal: parseFloat(newNominal) || 0,
      isLunas: false,
    };

    setDataPembayaran((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newItem],
    }));

    setNewNama('');
    setNewNominal('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. RINGKASAN PALING ATAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TOTAL LUNAS */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Total Lunas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-400">
              {formatYuan(totalLunas)}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {formatIDR(totalLunas)}
            </p>
          </div>
        </div>

        {/* TOTAL BELUM DIBAYARKAN */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Total Belum Dibayarkan
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-rose-400">
              {formatYuan(totalBelumLunas)}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {formatIDR(totalBelumLunas)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOMBOL PILIHAN TAHUN KULIAH */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {listTahun.map((tahun) => {
          const isActive = activeTab === tahun;
          return (
            <button
              key={tahun}
              onClick={() => {
                setActiveTab(tahun);
                setEditingId(null);
                setShowAddForm(false);
              }}
              className={
                isActive
                  ? 'px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap bg-purple-600 text-white shadow-lg border border-purple-500 transition-all'
                  : 'px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-all'
              }
            >
              {tahun}
            </button>
          );
        })}
      </div>

      {/* 3. DAFTAR CHECKLIST & NOMINAL */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Rincian Biaya: {activeTab}
            </h3>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tagihan</span>
          </button>
        </div>

        {/* FORM TAMBAH TAGIHAN BARU */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
            <p className="text-xs font-bold text-slate-300">Tambah Komponen Biaya Baru</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama Tagihan (cth: Biaya Asuransi)"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  placeholder="Nominal (Yuan)"
                  value={newNominal}
                  onChange={(e) => setNewNominal(e.target.value)}
                  className="w-full p-2.5 pr-8 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">¥</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* LIST ITEM TAGIHAN */}
        <div className="space-y-3">
          {(dataPembayaran[activeTab] || []).length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">Belum ada data tagihan untuk {activeTab}.</p>
            </div>
          ) : (
            dataPembayaran[activeTab].map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                    item.isLunas
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-80'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-purple-500/40'
                  }`}
                >
                  {/* LEFT: CHECKBOX & NAMA TAGIHAN */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLunas(item.id)}
                      className="text-slate-400 hover:text-emerald-400 transition"
                    >
                      {item.isLunas ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    ) : (
                      <span
                        className={`text-xs font-bold ${
                          item.isLunas ? 'text-slate-400 line-through' : 'text-white'
                        }`}
                      >
                        {item.nama}
                      </span>
                    )}
                  </div>

                  {/* RIGHT: NOMINAL & ACTION BUTTONS */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                    {isEditing ? (
                      <div className="relative flex items-center w-32">
                        <input
                          type="number"
                          step="any"
                          value={editNominal}
                          onChange={(e) => setEditNominal(e.target.value)}
                          className="w-full p-1.5 pr-6 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <span className="absolute right-2 text-xs text-slate-400">¥</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p
                          className={`text-xs font-black ${
                            item.isLunas ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatYuan(item.nominal)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {formatIDR(item.nominal)}
                        </p>
                      </div>
                    )}

                    {/* BUTTON ACTIONS */}
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                            title="Simpan"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                            title="Edit Nominal / Nama"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Tagihan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
