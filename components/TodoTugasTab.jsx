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
  Calendar as CalendarIcon, 
  Loader2,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// FUNGSI HITUNG PRIORITAS OTOMATIS BERDASARKAN TENGGAT WAKTU
const getHitungPrioritas = (tenggatStr) => {
  if (!tenggatStr) return 'Rendah';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tenggatDate = new Date(tenggatStr);
  tenggatDate.setHours(0, 0, 0, 0);

  const diffTime = tenggatDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return 'Tinggi';
  } else if (diffDays <= 3) {
    return 'Sedang';
  } else {
    return 'Rendah';
  }
};

// HELPER MEMERIKSA APAKAH TENGGAT SUDAH LEBIH DARI 1 BULAN (30 HARI)
const isMoreThanOneMonthOld = (tenggatStr) => {
  if (!tenggatStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tenggatDate = new Date(tenggatStr);
  tenggatDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - tenggatDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 30; // Lebih dari 30 hari yang lalu
};

export default function TodoTugasTab() {
  const [todoList, setTodoList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State History Modal & Filter
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear().toString());
  const [historyMonth, setHistoryMonth] = useState('Semua');

  // State Kalender & Pop-up Klik Tanggal
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateTasks, setSelectedDateTasks] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // State Edit
  const [editingId, setEditingId] = useState(null);
  const [editJudul, setEditJudul] = useState('');
  const [editTenggat, setEditTenggat] = useState('');

  // State Form Tambah Tugas
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJudul, setNewJudul] = useState('');
  const [newTenggat, setNewTenggat] = useState('');

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

  // TOGGLE SELESAI
  const handleToggleSelesai = async (id, statusSekarang) => {
    const newStatus = !statusSekarang;

    setTodoList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selesai: newStatus } : item
      )
    );

    if (selectedDateTasks) {
      setSelectedDateTasks((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, selesai: newStatus } : item
        )
      );
    }

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
  };

  const handleSaveEdit = async (id) => {
    const formattedTenggat = editTenggat || null;
    const computedPrioritas = getHitungPrioritas(formattedTenggat);

    setTodoList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              judul: editJudul,
              tenggat_waktu: formattedTenggat,
              prioritas: computedPrioritas,
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
        prioritas: computedPrioritas,
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
    if (selectedDateTasks) {
      setSelectedDateTasks((prev) => prev.filter((item) => item.id !== id));
    }

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
    const computedPrioritas = getHitungPrioritas(formattedTenggat);

    const { data, error } = await supabase
      .from('todo_tugas')
      .insert([
        {
          judul: newJudul,
          tenggat_waktu: formattedTenggat,
          prioritas: computedPrioritas,
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
      setShowAddForm(false);
    }
  };

  // STATISTIK
  const totalTugas = todoList.length;
  const totalSelesai = todoList.filter((item) => item.selesai).length;
  const totalBelum = totalTugas - totalSelesai;

  // DIHITUNG DENGAN PRIORITAS OTOMATIS DAN DISORTING
  const processedList = todoList
    .map((item) => ({
      ...item,
      prioritas: getHitungPrioritas(item.tenggat_waktu),
    }))
    .sort((a, b) => {
      if (a.selesai !== b.selesai) {
        return a.selesai ? 1 : -1;
      }
      return 0;
    });

  // HIDE TUGAS YANG LEBIH DARI 1 BULAN DARI LIST UTAMA
  const activeTodoList = processedList.filter(
    (item) => !isMoreThanOneMonthOld(item.tenggat_waktu)
  );

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

  // HELPER KALENDER
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };
  const nextMonthDays = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleDayClick = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const tasksOnDate = processedList.filter(
      (item) => item.tenggat_waktu === dateStr
    );

    setSelectedDateStr(`${dayNum} ${monthNames[month]} ${year}`);
    setSelectedDateTasks(tasksOnDate);
  };

  // FILTER TUGAS UNTUK MODAL HISTORY
  const historyList = processedList.filter((item) => {
    if (!item.tenggat_waktu) return false;
    const taskDate = new Date(item.tenggat_waktu);
    const taskYear = taskDate.getFullYear().toString();
    const taskMonth = (taskDate.getMonth() + 1).toString().padStart(2, '0');

    const matchYear = historyYear === 'Semua' || taskYear === historyYear;
    const matchMonth = historyMonth === 'Semua' || taskMonth === historyMonth;

    return matchYear && matchMonth;
  });

  // MENDAPATKAN DAFTAR TAHUN YANG TERSEDIA DI DATABASE
  const availableYears = Array.from(
    new Set(
      processedList
        .filter((item) => item.tenggat_waktu)
        .map((item) => new Date(item.tenggat_waktu).getFullYear().toString())
    )
  ).sort((a, b) => b - a);

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

      {/* KALENDER WIDGET */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              KALENDER TUGAS ({monthNames[month].toUpperCase()} {year})
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonthDays}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonthDays}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GRID KALENDER */}
        <div className="grid grid-cols-7 gap-1.5 text-xs">
          {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
            <div key={d} className="font-extrabold text-slate-400 py-2 text-center text-xs">
              {d}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            const tasksForThisDay = processedList.filter(
              (item) => item.tenggat_waktu === dateStr
            );

            const displayTasks = tasksForThisDay.slice(0, 2);
            const extraCount = tasksForThisDay.length - 2;

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className="min-h-[85px] p-2 rounded-xl flex flex-col items-start justify-start border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/50 transition relative text-left group"
              >
                <span className="text-xs font-black text-slate-300 group-hover:text-purple-400">
                  {dayNum}
                </span>

                <div className="w-full mt-1.5 space-y-1">
                  {displayTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${
                        t.selesai
                          ? 'bg-slate-800/60 border-slate-700/50 text-slate-500 line-through'
                          : t.prioritas === 'Tinggi'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : t.prioritas === 'Sedang'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      }`}
                      title={t.judul}
                    >
                      {t.judul}
                    </div>
                  ))}

                  {extraCount > 0 && (
                    <p className="text-[9px] font-bold text-slate-500 pl-0.5">
                      +{extraCount} lainnya
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* POP-UP MODAL TANGGAL KALENDER */}
      {selectedDateTasks !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-lg w-full space-y-4 relative">
            <button
              onClick={() => setSelectedDateTasks(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-bold text-white">
                Tugas Tanggal: {selectedDateStr}
              </h4>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Tidak ada tugas untuk tanggal ini.
                </p>
              ) : (
                selectedDateTasks.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      item.selesai
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSelesai(item.id, item.selesai)}
                        className="text-slate-400 hover:text-emerald-400"
                      >
                        {item.selesai ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            item.selesai ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {item.judul}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border inline-block mt-1 ${getPrioritasBadge(
                            item.prioritas
                          )}`}
                        >
                          Prioritas: {item.prioritas}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORY TUGAS (PER TAHUN & PER BULAN) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-2xl w-full space-y-5 relative">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <History className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-sm font-bold text-white">History Tugas</h4>
                <p className="text-[11px] text-slate-400">
                  Arsip seluruh tugas berdasarkan tahun dan bulan.
                </p>
              </div>
            </div>

            {/* FILTER TAHUN & BULAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pilih Tahun
                </label>
                <select
                  value={historyYear}
                  onChange={(e) => setHistoryYear(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Semua">Semua Tahun</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Tahun {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pilih Bulan
                </label>
                <select
                  value={historyMonth}
                  onChange={(e) => setHistoryMonth(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Semua">Semua Bulan</option>
                  {monthNames.map((name, index) => {
                    const monthVal = (index + 1).toString().padStart(2, '0');
                    return (
                      <option key={monthVal} value={monthVal}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* LIST DAFTAR HISTORY */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {historyList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                  Tidak ada history tugas pada periode ini.
                </p>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      item.selesai
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSelesai(item.id, item.selesai)}
                        className="text-slate-400 hover:text-emerald-400"
                      >
                        {item.selesai ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold ${
                            item.selesai ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {item.judul}
                        </p>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold border ${getPrioritasBadge(
                              item.prioritas
                            )}`}
                          >
                            {item.prioritas}
                          </span>
                          <span className="text-slate-400">
                            Tenggat: {item.tenggat_waktu}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DAFTAR TODO TUGAS UTAMA */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Daftar Todo Tugas
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* TOMBOL HISTORY TUGAS */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>History Tugas</span>
            </button>

            {/* TOMBOL TAMBAH TUGAS */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* FORM TAMBAH TUGAS */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
            <p className="text-xs font-bold text-slate-300">Tambah Tugas Baru</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* LIST TUGAS UTAMA */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs font-medium">Memuat data tugas...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTodoList.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">Tidak ada tugas aktif.</p>
              </div>
            ) : (
              activeTodoList.map((item) => {
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              <span
                                className={`px-2 py-0.5 rounded-md font-semibold border ${getPrioritasBadge(
                                  item.prioritas
                                )}`}
                              >
                                {item.prioritas}
                              </span>

                              {item.tenggat_waktu && (
                                <span className="text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md">
                                  <CalendarIcon className="w-3 h-3 text-slate-400" />
                                  Tenggat: {item.tenggat_waktu}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

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
