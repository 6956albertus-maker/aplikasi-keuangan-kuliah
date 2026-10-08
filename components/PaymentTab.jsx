import React, { useState, useEffect } from 'react';
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
  Clock,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatYuan, formatIDR } from '../lib/utils';

export default function PaymentTab() {
  const [activeTab, setActiveTab] = useState('Tahun Bahasa');
  const [pembayaranList, setPembayaranList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Form Edit
  const [editingId, setEditingId] = useState(null);
  const [editNama, setEditNama] = useState('');
  const [editNominal, setEditNominal] = useState('');

  // State Form Tambah Tagihan Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNominal, setNewNominal] = useState('');

  const listTahun = ['Tahun Bahasa', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4'];

  // 1. FETCH DATA DARI SUPABASE
  const fetchPembayaran = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pembayaran_kuliah')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setPembayaranList(data);
    } catch (err) {
      console.error('Gagal mengambil data pembayaran:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPembayaran();
  }, []);

  // 2. HITUNG TOTAL KESELURUHAN (SEMUA TAHUN)
  let totalLunas = 0;
  let totalBelumLunas = 0;

  pembayaranList.forEach((item) => {
    const val = Number(item.jumlah_yuan) || 0;
    if (item.sudah_dibayar) {
      totalLunas += val;
    } else {
      totalBelumLunas += val;
    }
  });

  // Filter list berdasarkan tahun yang aktif
  const currentItems = pembayaranList.filter(
    (item) => item.kategori_tahun === activeTab
  );

  // 3. TOGGLE CHECKBOX (UPDATE SUPABASE)
  const handleToggleLunas = async (id, statusSekarang) => {
    const newStatus = !statusSekarang;
    
    // Update State Lokal
    setPembayaranList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sudah_dibayar: newStatus } : item))
    );

    // Update Database Supabase
    const { error } = await supabase
      .from('pembayaran_kuliah')
      .update({ sudah_dibayar: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui status:', error.message);
      fetchPembayaran(); // Rollback jika error
    }
  };

  // 4. MULAI & SIMPAN EDIT (UPDATE SUPABASE)
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditNama(item.nama_tagihan);
    setEditNominal(item.jumlah_yuan);
  };

  const handleSaveEdit = async (id) => {
    const parsedNominal = parseFloat(editNominal) || 0;

    // Update State Lokal
    setPembayaranList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, nama_tagihan: editNama, jumlah_yuan: parsedNominal }
          : item
      )
    );
    setEditingId(null);

    // Update Database Supabase
    const { error } = await supabase
      .from('pembayaran_kuliah')
      .update({
        nama_tagihan: editNama,
        jumlah_yuan: parsedNominal,
      })
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui tagihan:', error.message);
      fetchPembayaran();
    }
  };

  // 5. HAPUS ITEM (DELETE SUPABASE)
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) return;

    setPembayaranList((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from('pembayaran_kuliah')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus tagihan:', error.message);
      fetchPembayaran();
    }
  };

  // 6. TAMBAH ITEM BARU (INSERT SUPABASE)
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newNama || !newNominal) return;

    const parsedNominal = parseFloat(newNominal) || 0;

    const { data, error } = await supabase
      .from('pembayaran_kuliah')
      .insert([
        {
          kategori_tahun: activeTab,
          nama_tagihan: newNama,
          jumlah_yuan: parsedNominal,
          sudah_dibayar: false,
        },
      ])
      .select();

    if (error) {
      console.error('Gagal menambah tagihan:', error.message);
      alert('Gagal menambah data ke database.');
    } else if (data) {
      setPembayaranList((prev) => [...prev, ...data]);
      setNewNama('');
      setNewNominal('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* RINGKASAN PALING ATAS */}
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

      {/* NAVIGASI TOMBOL TAHUN */}
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

      {/* DAFTAR CHECKLIST & NOMINAL */}
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
            <p className="text-xs font-bold text-slate-300">Tambah Tagihan ke {activeTab}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama Tagihan (cth: Language Learning)"
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

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs font-medium">Memuat data dari Supabase...</p>
          </div>
        ) : (
          /* LIST ITEM TAGIHAN */
          <div className="space-y-3">
            {currentItems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">Belum ada data tagihan untuk {activeTab}.</p>
              </div>
            ) : (
              currentItems.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                      item.sudah_dibayar
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-80'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-purple-500/40'
                    }`}
                  >
                    {/* CHECKBOX & NAMA TAGIHAN */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleLunas(item.id, item.sudah_dibayar)}
                        className="text-slate-400 hover:text-emerald-400 transition"
                      >
                        {item.sudah_dibayar ? (
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
                            item.sudah_dibayar ? 'text-slate-400 line-through' : 'text-white'
                          }`}
                        >
                          {item.nama_tagihan}
                        </span>
                      )}
                    </div>

                    {/* NOMINAL & ACTION BUTTONS */}
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
                              item.sudah_dibayar ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatYuan(item.jumlah_yuan)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatIDR(item.jumlah_yuan)}
                          </p>
                        </div>
                      )}

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
        )}
      </div>
    </div>
  );
}
