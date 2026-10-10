import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  CalendarDays,
  Tag
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AgendaKuliahTab() {
  const [agendaList, setAgendaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Kalender Agenda
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateAgenda, setSelectedDateAgenda] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // State Form Tambah Agenda
  const [showAddForm, setShowAddForm] = useState(false);
  const [judul, setJudul] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jam, setJam] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:00');
  const [seharian, setSeharian] = useState(false);

  // State Edit Agenda
  const [editingId, setEditingId] = useState(null);
  const [editJudul, setEditJudul] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editTanggalSelesai, setEditTanggalSelesai] = useState('');
  const [editJam, setEditJam] = useState('');
  const [editJamSelesai, setEditJamSelesai] = useState('');
  const [editSeharian, setEditSeharian] = useState(false);

  // 1. FETCH DATA DARI SUPABASE (Disinkronkan dengan tabel agenda_kuliah)
  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agenda_kuliah')
        .select('*')
        .order('tanggal', { ascending: true });

      if (error) throw error;
      if (data) setAgendaList(data);
    } catch (err) {
      console.error('Gagal mengambil data agenda:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  // 2. TAMBAH AGENDA BARU (Sesuai Struktur Kolom Supabase)
  const handleAddAgenda = async (e) => {
    e.preventDefault();
    if (!judul || !tanggal) {
      alert('Judul Acara dan Tanggal wajib diisi!');
      return;
    }

    const newAgendaData = {
      judul: judul,
      keterangan: keterangan || 'EMPTY',
      tanggal: tanggal,
      tanggal_selesai: tanggalSelesai || tanggal,
      jam: seharian ? null : jam,
      jam_selesai: seharian ? null : jamSelesai,
      seharian: seharian,
      tipe: 'acara'
    };

    const { data, error } = await supabase
      .from('agenda_kuliah')
      .insert([newAgendaData])
      .select();

    if (error) {
      console.error('Gagal menyimpan agenda:', error.message);
      alert('Gagal menyimpan agenda: ' + error.message);
    } else if (data) {
      setAgendaList((prev) => [...prev, ...data]);
      setJudul('');
      setKeterangan('');
      setTanggal('');
      setTanggalSelesai('');
      setJam('08:00');
      setJamSelesai('10:00');
      setSeharian(false);
      setShowAddForm(false);
    }
  };

  // 3. EDIT AGENDA
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditJudul(item.judul || '');
    setEditKeterangan(item.keterangan || '');
    setEditTanggal(item.tanggal || '');
    setEditTanggalSelesai(item.tanggal_selesai || item.tanggal || '');
    setEditJam(item.jam || '08:00');
    setEditJamSelesai(item.jam_selesai || '10:00');
    setEditSeharian(item.seharian || false);
  };

  const handleSaveEdit = async (id) => {
    const updatedData = {
      judul: editJudul,
      keterangan: editKeterangan,
      tanggal: editTanggal,
      tanggal_selesai: editTanggalSelesai || editTanggal,
      jam: editSeharian ? null : editJam,
      jam_selesai: editSeharian ? null : editJamSelesai,
      seharian: editSeharian,
      tipe: 'acara'
    };

    setAgendaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    setEditingId(null);

    const { error } = await supabase
      .from('agenda_kuliah')
      .update(updatedData)
      .eq('id', id);

    if (error) {
      console.error('Gagal memperbarui agenda:', error.message);
      fetchAgenda();
    }
  };

  // 4. HAPUS AGENDA
  const handleDeleteAgenda = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;

    setAgendaList((prev) => prev.filter((item) => item.id !== id));
    if (selectedDateAgenda) {
      setSelectedDateAgenda((prev) => prev.filter((item) => item.id !== id));
    }

    const { error } = await supabase
      .from('agenda_kuliah')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus agenda:', error.message);
      fetchAgenda();
    }
  };

  // HELPER KALENDER
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleDayClick = (dayNum) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const activeAgendas = agendaList.filter((item) => {
      const start = item.tanggal;
      const end = item.tanggal_selesai || item.tanggal;
      return dateStr >= start && dateStr <= end;
    });

    setSelectedDateStr(`${dayNum} ${monthNames[month]} ${year}`);
    setSelectedDateAgenda(activeAgendas);
  };

  return (
    <div className="space-y-6">
      {/* 1. KALENDER AGENDA */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              KALENDER AGENDA ({monthNames[month].toUpperCase()} {year})
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

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

            const agendasOnDay = agendaList.filter((item) => {
              const start = item.tanggal;
              const end = item.tanggal_selesai || item.tanggal;
              return dateStr >= start && dateStr <= end;
            });

            const displayAgendas = agendasOnDay.slice(0, 2);
            const extraCount = agendasOnDay.length - 2;

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className="min-h-[85px] p-2 rounded-xl flex flex-col items-start justify-start border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/50 transition relative text-left group"
              >
                <span className="text-xs font-black text-slate-300 group-hover:text-indigo-400">
                  {dayNum}
                </span>

                <div className="w-full mt-1.5 space-y-1">
                  {displayAgendas.map((item) => (
                    <div
                      key={item.id}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate border bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                      title={item.judul}
                    >
                      {item.judul}
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

      {/* POPUP KLIK TANGGAL */}
      {selectedDateAgenda !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-lg w-full space-y-4 relative">
            <button
              onClick={() => setSelectedDateAgenda(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">
                Agenda Tanggal: {selectedDateStr}
              </h4>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedDateAgenda.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Tidak ada agenda pada tanggal ini.
                </p>
              ) : (
                selectedDateAgenda.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">{item.judul}</p>
                      {item.keterangan && item.keterangan !== 'EMPTY' && (
                        <p className="text-[11px] text-slate-400">{item.keterangan}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          {item.seharian
                            ? 'Seharian'
                            : `${item.jam || '-'} - ${item.jam_selesai || '-'}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAgenda(item.id)}
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

      {/* 2. DAFTAR AGENDA KULIAH */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Daftar Agenda Kuliah
            </h3>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda</span>
          </button>
        </div>

        {/* FORM INPUT TAMBAH AGENDA */}
        {showAddForm && (
          <form
            onSubmit={handleAddAgenda}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4"
          >
            <p className="text-xs font-bold text-slate-200">Input Agenda Baru</p>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Judul Agenda
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ambil Passport / Libur Nasional"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Keterangan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Residence Permit / Yan Laoshi"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Acara Seharian?
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeharian(!seharian)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                      seharian
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                  >
                    {seharian ? 'Ya (Seharian)' : 'Tidak'}
                  </button>
                </div>

                {!seharian && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-700/50">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Jam
                      </label>
                      <input
                        type="time"
                        value={jam}
                        onChange={(e) => setJam(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={jamSelesai}
                        onChange={(e) => setJamSelesai(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Simpan Agenda
              </button>
            </div>
          </form>
        )}

        {/* LIST DAFTAR AGENDA */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs font-medium">Memuat data agenda...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agendaList.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">Belum ada agenda terdaftar.</p>
              </div>
            ) : (
              agendaList.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border bg-slate-800/40 border-slate-700/60 hover:border-indigo-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {isEditing ? (
                      <div className="w-full space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editJudul}
                            onChange={(e) => setEditJudul(e.target.value)}
                            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                            placeholder="Judul"
                          />
                          <input
                            type="text"
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                            placeholder="Keterangan"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={editTanggal}
                            onChange={(e) => setEditTanggal(e.target.value)}
                            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs"
                          />
                          <input
                            type="date"
                            value={editTanggalSelesai}
                            onChange={(e) => setEditTanggalSelesai(e.target.value)}
                            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setEditSeharian(!editSeharian)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                              editSeharian
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {editSeharian ? 'Seharian' : 'Ada Jam'}
                          </button>
                          {!editSeharian && (
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={editJam}
                                onChange={(e) => setEditJam(e.target.value)}
                                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                              />
                              <input
                                type="time"
                                value={editJamSelesai}
                                onChange={(e) => setEditJamSelesai(e.target.value)}
                                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <p className="text-xs font-extrabold text-white">
                            {item.judul}
                          </p>
                          {item.keterangan && item.keterangan !== 'EMPTY' && (
                            <p className="text-[11px] text-slate-400">{item.keterangan}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {item.tipe || 'acara'}
                            </span>

                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                              {item.tanggal}
                              {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal
                                ? ` s/d ${item.tanggal_selesai}`
                                : ''}
                            </span>

                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              {item.seharian
                                ? 'Seharian'
                                : `${item.jam || '-'} - ${item.jam_selesai || '-'}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgenda(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
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
