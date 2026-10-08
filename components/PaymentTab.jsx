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
  Calendar,
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
  const [editTenggat, setEditTenggat] = useState('');

  // State Form Tambah Tagihan Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNominal, setNewNominal] = useState('');
  const [newTenggat, setNewTenggat] = useState('');

  const listTahun = ['Tahun Bahasa', 'Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4'];

  // FETCH DATA SUPABASE
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

  // HITUNG TOTAL
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

  const currentItems = pembayaranList.filter(
    (item) => item.kategori_tahun === activeTab
  );

  // TOGGLE STATUS LUNAS (UPDATE TANGGAL PEMBAYARAN)
  const handleToggleLunas = async (id, statusSekarang) => {
    const newStatus = !statusSekarang;
    const today = newStatus ? new Date().toISOString().split('T')[0] : null;

    setPembayaranList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, sudah_dibayar: newStatus, tanggal_pembayaran: today }
          : item
      )
    );

    const { error } = await supabase
      .from('pembayaran_kuliah')
      .update({
        sudah_dibayar: newStatus,
        tanggal_pembayaran: today,
      })
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui status:', error.message);
      fetchPembayaran();
    }
  };

  // MULAI & SIMPAN EDIT
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditNama(item.nama_tagihan);
    setEditNominal(item.jumlah_yuan);
    setEditTenggat(item.tenggat_waktu || '');
  };

  const handleSaveEdit = async (id) => {
    const parsedNominal = parseFloat(editNominal) || 0;
    const formattedTenggat = editTenggat || null;

    setPembayaranList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              nama_tagihan: editNama,
              jumlah_yuan: parsedNominal,
              tenggat_waktu: formattedTenggat,
            }
          : item
      )
    );
    setEditingId(null);

    const { error } = await supabase
      .from('pembayaran_kuliah')
      .update({
        nama_tagihan: editNama,
        jumlah_yuan: parsedNominal,
        tenggat_waktu: formattedTenggat,
      })
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui tagihan:', error.message);
      fetchPembayaran();
    }
  };

  // HAPUS ITEM
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

  // TAMBAH ITEM BARU
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newNama || !newNominal) return;

    const parsedNominal = parseFloat(newNominal) || 0;
    const formattedTenggat = newTenggat || null;

    const { data, error } = await supabase
      .from('pembayaran_kuliah')
      .insert([
        {
          kategori_tahun: activeTab,
          nama_tagihan: newNama,
          jumlah_yuan: parsedNominal,
          sudah_dibayar: false,
          tenggat_waktu: formattedTenggat,
          tanggal_pembayaran: null,
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
      setNewTenggat('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* RINGKASAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* NAVIGASI TAHUN */}
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

      {/* RINCIAN BIAYA */}
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

        {/* FORM TAMBAH TAGIHAN */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
            <p className="text-xs font-bold text-slate-300">Tambah Tagihan Baru</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nama Tagihan"
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
              <div className="flex items-center">
                <input
                  type="date"
                  placeholder="Tenggat Waktu"
                  value={newTenggat}
                  onChange={(e) => setNewTenggat(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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

        {/* LOADING */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs font-medium">Memuat data...</p>
          </div>
        ) : (
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
                    {/* CHECKBOX & INFO TAGIHAN */}
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleLunas(item.id, item.sudah_dibayar)}
                        className="text-slate-400 hover:text-emerald-400 transition mt-0.5 sm:mt-0"
                      >
                        {item.sudah_dibayar ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editNama}
                              onChange={(e) => setEditNama(e.target.value)}
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">Tenggat:</span>
                              <input
                                type="date"
                                value={editTenggat}
                                onChange={(e) => setEditTenggat(e.target.value)}
                                className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`text-xs font-bold block ${
                                item.sudah_dibayar ? 'text-slate-400 line-through' : 'text-white'
                              }`}
                            >
                              {item.nama_tagihan}
                            </span>

                            {/* TANGGAL & TENGGAT INFO */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              {item.tenggat_waktu && (
                                <span className="text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Tenggat: {item.tenggat_waktu}
                                </span>
                              )}
                              {item.sudah_dibayar && item.tanggal_pembayaran && (
                                <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
                                  <Check className="w-3 h-3" />
                                  Dibayar: {item.tanggal_pembayaran}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* NOMINAL & ACTION BUTTONS */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                      {isEditing ? (
                        <div className="relative flex items-center w-28">
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
                              title="Edit Tagihan"
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
