import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ListTodo, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Loader2,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function TodoTugasTab() {
  const [todoList, setTodoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPrioritas, setFilterPrioritas] = useState('Semua');

  // State Edit
  const [editingId, setEditingId] = useState(null);
  const [editJudul, setEditJudul] = useState('');
  const [editTenggat, setEditTenggat] = useState('');
  const [editPrioritas, setEditPrioritas] = useState('Sedang');

  // State Tambah Tugas Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJudul, setNewJudul] = useState('');
  const [newTenggat, setNewTenggat] = useState('');
  const [newPrioritas, setNewPrioritas] = useState('Sedang');

  // FETCH DATA SUPABASE
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todo_tugas')
        .select('*')
        .order('selesai', { ascending: true })
        .order('tenggat_waktu', { ascending: true, nullsFirst: false });

      if (error) throw error;
      if (data) setTodoList(data);
    } catch (err) {
      console.error('Gagal mengambil data todo tugas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // TOGGLE SELESAI / BELUM SELESAI
  const handleToggleSelesai = async (id, statusSekarang) => {
    const newStatus = !statusSekarang;

    setTodoList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selesai: newStatus } : item
      )
    );

    const { error } = await supabase
      .from('todo_tugas')
      .update({ selesai: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui status tugas:', error.message);
      fetchTodos();
    }
  };

  // EDIT TUGAS
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditJudul(item.judul || '');
    setEditTenggat(item.tenggat_waktu || '');
    setEditPrioritas(item.prioritas || 'Sedang');
  };

  const handleSaveEdit = async (id) => {
    const formattedTenggat = editTenggat || null;

    setTodoList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              judul: editJudul,
              tenggat_waktu: formattedTenggat,
              prioritas: editPrioritas,
            }
          : item
      )
    );
    setEditingId(null);

    const { error } = await supabase
      .from('todo_tugas')
      .update({
        judul: editJudul,
        tenggat_waktu: formattedTenggat,
        prioritas: editPrioritas,
      })
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui tugas:', error.message);
      fetchTodos();
    }
  };

  // HAPUS TUGAS
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    setTodoList((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from('todo_tugas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus tugas:', error.message);
      fetchTodos();
    }
  };

  // TAMBAH TUGAS BARU
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newJudul) return;

    const formattedTenggat = newTenggat || null;

    const { data, error } = await supabase
      .from('todo_tugas')
      .insert([
        {
          judul: newJudul,
          tenggat_waktu: formattedTenggat,
          prioritas: newPrioritas,
          selesai: false,
        },
      ])
      .select();

    if (error) {
      console.error('Gagal menambah tugas:', error.message);
      alert('Gagal menambah tugas ke database.');
    } else if (data) {
      setTodoList((prev) => [...prev, ...data]);
      setNewJudul('');
      setNewTenggat('');
      setNewPrioritas('Sedang');
      setShowAddForm(false);
    }
  };

  // STATISTIK
  const totalTugas = todoList.length;
  const totalSelesai = todoList.filter((item) => item.selesai).length;
  const totalBelum = totalTugas - totalSelesai;

  // FILTERED LIST
  const filteredList = todoList.filter((item) => {
    if (filterPrioritas === 'Semua') return true;
    return item.prioritas === filterPrioritas;
  });

  // BADGE PRIORITAS COLOR
  const getPrioritasBadge = (prio) => {
    switch (prio) {
      case 'Tinggi':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Sedang':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Rendah':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* RINGKASAN DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-purple-400" /> Total Tugas
            </span>
          </div>
          <p className="text-3xl font-black text-white">{totalTugas}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Selesai
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-400">{totalSelesai}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Belum Selesai
            </span>
          </div>
          <p className="text-3xl font-black text-amber-400">{totalBelum}</p>
        </div>
      </div>

      {/* RINCIAN & AKSI */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Daftar Todo Tugas
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* FILTER PRIORITAS */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {['Semua', 'Tinggi', 'Sedang', 'Rendah'].map((prio) => (
                <button
                  key={prio}
                  onClick={() => setFilterPrioritas(prio)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                    filterPrioritas === prio
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* FORM TAMBAH TUGAS BARU */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
            <p className="text-xs font-bold text-slate-300">Tambah Tugas Baru</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Judul Tugas / Catatan"
                value={newJudul}
                onChange={(e) => setNewJudul(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="date"
                value={newTenggat}
                onChange={(e) => setNewTenggat(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newPrioritas}
                onChange={(e) => setNewPrioritas(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Tinggi">Prioritas Tinggi</option>
                <option value="Sedang">Prioritas Sedang</option>
                <option value="Rendah">Prioritas Rendah</option>
              </select>
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

        {/* LOADING & DAFTAR TUGAS */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs font-medium">Memuat data tugas...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">Tidak ada tugas ditemukan.</p>
              </div>
            ) : (
              filteredList.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                      item.selesai
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-purple-500/40'
                    }`}
                  >
                    {/* CHECKBOX & JUDUL TUGAS */}
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSelesai(item.id, item.selesai)}
                        className="text-slate-400 hover:text-emerald-400 transition mt-0.5 sm:mt-0"
                      >
                        {item.selesai ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editJudul}
                              onChange={(e) => setEditJudul(e.target.value)}
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <input
                              type="date"
                              value={editTenggat}
                              onChange={(e) => setEditTenggat(e.target.value)}
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                            />
                            <select
                              value={editPrioritas}
                              onChange={(e) => setEditPrioritas(e.target.value)}
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                            >
                              <option value="Tinggi">Tinggi</option>
                              <option value="Sedang">Sedang</option>
                              <option value="Rendah">Rendah</option>
                            </select>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`text-xs font-bold block ${
                                item.selesai ? 'text-slate-400 line-through' : 'text-white'
                              }`}
                            >
                              {item.judul}
                            </span>

                            {/* TENGGAT WAKTU & BADGE PRIORITAS */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              {item.prioritas && (
                                <span
                                  className={`px-2 py-0.5 rounded-md font-semibold border ${getPrioritasBadge(
                                    item.prioritas
                                  )}`}
                                >
                                  {item.prioritas}
                                </span>
                              )}

                              {item.tenggat_waktu && (
                                <span className="text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Tenggat: {item.tenggat_waktu}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-end gap-1 pl-9 sm:pl-0">
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
                            title="Edit Tugas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
