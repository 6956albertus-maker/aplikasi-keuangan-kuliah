import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3,
  BookOpen, 
  CalendarDays, 
  Power, 
  RotateCcw,
  Check,
  PlusCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Building2,
  DoorClosed
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// DAFTAR WAKTU TEPAT PER JAM PELAJARAN (12 SESI + BREAK 5 MINS)
const TIME_SLOTS = [
  { jam: 1,  waktu: '08:00 - 08:45' },
  { jam: 2,  waktu: '08:50 - 09:35' },
  { jam: 3,  waktu: '09:50 - 10:35' },
  { jam: 4,  waktu: '10:40 - 11:25' },
  { jam: 5,  waktu: '14:00 - 14:45' },
  { jam: 6,  waktu: '14:50 - 15:35' },
  { jam: 7,  waktu: '15:50 - 16:35' },
  { jam: 8,  waktu: '16:40 - 17:25' },
  { jam: 9,  waktu: '19:30 - 20:15' },
  { jam: 10, waktu: '20:20 - 21:05' },
  { jam: 11, waktu: '21:20 - 22:05' },
  { jam: 12, waktu: '22:10 - 22:55' },
];

const INITIAL_FIXED_SCHEDULE = {
  Senin: [
    { id: 'fixed-s1', matkul: 'Chinese Comprehensive Course', tempat: 'Gedung 2 Ruangan 1-2', jam: [3, 4], active: true },
    { id: 'fixed-s2', matkul: 'Chinese Listening Course', tempat: 'Gedung 2 Ruangan 111', jam: [5, 6], active: true },
    { id: 'fixed-s3', matkul: 'Chinese Speaking Course', tempat: 'Gedung 2 Ruangan 209', jam: [7, 8], active: true },
  ],
  Selasa: [
    { id: 'fixed-se1', matkul: 'Chinese Comprehensive Course', tempat: 'Gedung 2 Ruangan 303', jam: [3, 4], active: true },
    { id: 'fixed-se2', matkul: 'Chinese Reading and Writing Course', tempat: 'Gedung 2 Ruangan 111', jam: [5, 6], active: true },
  ],
  Rabu: [
    { id: 'fixed-r1', matkul: 'Chinese Culture Course', tempat: 'Gedung 2 Ruangan 2-1', jam: [1, 2], active: true },
    { id: 'fixed-r2', matkul: 'Chinese Reading and Writing Course', tempat: 'Gedung 2 Ruangan 111', jam: [3, 4], active: true },
  ],
  Kamis: [
    { id: 'fixed-k1', matkul: 'Chinese Speaking Course', tempat: 'Gedung 2 Ruangan 307', jam: [1, 2], active: true },
    { id: 'fixed-k2', matkul: 'Chinese Listening Course', tempat: 'Gedung Teaching Ruangan 1-2', jam: [3, 4], active: true },
  ],
  Jumat: [
    { id: 'fixed-j1', matkul: 'Chinese Culture Course', tempat: 'Gedung 2 Ruangan 203', jam: [3, 4], active: true },
  ],
  Sabtu: [],
  Minggu: []
};

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// HELPER UNTUK MENGHITUNG MINGGU KULIAH BERJALAN
const getCalculatedCollegeWeek = (semesterStartDateStr) => {
  const startDate = new Date(semesterStartDateStr || '2026-09-01');
  const today = new Date();
  const diffTime = Math.max(0, today - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

export default function JadwalKuliahTab() {
  const [selectedDay, setSelectedDay] = useState('Kamis');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [activeWeek, setActiveWeek] = useState(1); // MINGGU YANG SEDANG DILIHAT/DIPILIH USER
  
  const [fixedSchedule, setFixedSchedule] = useState(INITIAL_FIXED_SCHEDULE);
  const [additionalSchedule, setAdditionalSchedule] = useState([]);
  
  // State Form Input / Edit
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // NULL = TAMBAH BARU, NOT NULL = EDIT
  const [inputHari, setInputHari] = useState('Kamis');
  const [inputMinggu, setInputMinggu] = useState(1);
  const [inputMatkul, setInputMatkul] = useState('');
  const [inputGedung, setInputGedung] = useState('');
  const [inputRuangan, setInputRuangan] = useState('');
  const [selectedJamList, setSelectedJamList] = useState([]);

  useEffect(() => {
    const loadWeekAndSchedule = async () => {
      let startDateStr = '2026-09-01';
      try {
        const { data } = await supabase
          .from('pengaturan')
          .select('value')
          .eq('key', 'semester_start_str')
          .single();

        if (data && data.value) startDateStr = data.value;
      } catch (e) {
        console.error(e);
      }

      const calculatedWeek = getCalculatedCollegeWeek(startDateStr);
      setCurrentWeek(calculatedWeek);
      setActiveWeek(calculatedWeek);
      setInputMinggu(calculatedWeek);

      // Load status smart chips minggu aktif
      loadChipsForWeek(calculatedWeek);
    };

    loadWeekAndSchedule();
    fetchAdditionalSchedule();
  }, []);

  const loadChipsForWeek = (weekNum) => {
    const weekStorageKey = `fixed_schedule_week_${weekNum}`;
    const savedChipStatus = localStorage.getItem(weekStorageKey);

    if (savedChipStatus) {
      try {
        setFixedSchedule(JSON.parse(savedChipStatus));
      } catch (e) {
        setFixedSchedule(INITIAL_FIXED_SCHEDULE);
      }
    } else {
      setFixedSchedule(INITIAL_FIXED_SCHEDULE);
      localStorage.setItem(weekStorageKey, JSON.stringify(INITIAL_FIXED_SCHEDULE));
    }
  };

  const handleWeekChange = (newWeek) => {
    const targetWeek = Math.max(1, Math.min(20, Number(newWeek)));
    setActiveWeek(targetWeek);
    setInputMinggu(targetWeek);
    loadChipsForWeek(targetWeek);
  };

  const fetchAdditionalSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('jadwal_kuliah')
        .select('*');

      if (error) throw error;
      if (data) setAdditionalSchedule(data);
    } catch (err) {
      console.error('Gagal mengambil jadwal tambahan:', err.message);
    }
  };

  const toggleFixedSchedule = (day, id) => {
    const updated = {
      ...fixedSchedule,
      [day]: fixedSchedule[day].map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    };
    setFixedSchedule(updated);
    localStorage.setItem(`fixed_schedule_week_${activeWeek}`, JSON.stringify(updated));
  };

  const handleResetChips = () => {
    setFixedSchedule(INITIAL_FIXED_SCHEDULE);
    localStorage.setItem(`fixed_schedule_week_${activeWeek}`, JSON.stringify(INITIAL_FIXED_SCHEDULE));
  };

  const handleJamCheckbox = (jamNum) => {
    if (selectedJamList.includes(jamNum)) {
      setSelectedJamList(selectedJamList.filter((j) => j !== jamNum));
    } else {
      setSelectedJamList([...selectedJamList, jamNum].sort((a, b) => a - b));
    }
  };

  // HELPER MENGGABUNGKAN TEKS GEDUNG DAN RUANGAN
  const formatTempatString = (gedung, ruangan) => {
    const g = gedung ? (gedung.toLowerCase().includes('gedung') ? gedung : `Gedung ${gedung}`) : '';
    const r = ruangan ? (ruangan.toLowerCase().includes('ruang') ? ruangan : `Ruangan ${ruangan}`) : '';
    return [g, r].filter(Boolean).join(' ');
  };

  // BUKA FORM UNTUK EDIT
  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setInputHari(item.hari || 'Kamis');
    setInputMinggu(item.minggu || activeWeek);
    setInputMatkul(item.matkul || '');

    // Parse gedung & ruangan jika tersimpan bersama
    let rawTempat = item.tempat || '';
    let gVal = '';
    let rVal = '';

    if (rawTempat.includes('Ruangan')) {
      const parts = rawTempat.split('Ruangan');
      gVal = parts[0].replace('Gedung', '').trim();
      rVal = parts[1].trim();
    } else if (rawTempat.includes('Gedung')) {
      gVal = rawTempat.replace('Gedung', '').trim();
    } else {
      gVal = rawTempat;
    }

    setInputGedung(gVal);
    setInputRuangan(rVal);
    setSelectedJamList(Array.isArray(item.kategori_jam) ? item.kategori_jam : []);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setInputMatkul('');
    setInputGedung('');
    setInputRuangan('');
    setSelectedJamList([]);
  };

  // SIMPAN TAMBAH ATAU EDIT JADWAL TAMBAHAN
  const handleSaveAdditionalSchedule = async (e) => {
    e.preventDefault();
    if (!inputMatkul || (!inputGedung && !inputRuangan) || selectedJamList.length === 0) {
      alert('Mohon isi Mata Kuliah, Gedung/Ruangan, dan pilih minimal 1 Jam Sesi!');
      return;
    }

    const compiledTempat = formatTempatString(inputGedung, inputRuangan);

    const payload = {
      hari: inputHari,
      matkul: inputMatkul,
      tempat: compiledTempat,
      kategori_jam: selectedJamList,
      minggu: Number(inputMinggu)
    };

    if (editingId) {
      // PROSES EDIT
      const { data, error } = await supabase
        .from('jadwal_kuliah')
        .update(payload)
        .eq('id', editingId)
        .select();

      if (error) {
        alert('Gagal memperbarui jadwal: ' + error.message);
      } else if (data) {
        setAdditionalSchedule((prev) =>
          prev.map((item) => (item.id === editingId ? data[0] : item))
        );
        handleCancelForm();
      }
    } else {
      // PROSES TAMBAH BARU
      const { data, error } = await supabase
        .from('jadwal_kuliah')
        .insert([payload])
        .select();

      if (error) {
        alert('Gagal menyimpan jadwal: ' + error.message);
      } else if (data) {
        setAdditionalSchedule((prev) => [...prev, ...data]);
        handleCancelForm();
      }
    }
  };

  const handleDeleteAdditional = async (id) => {
    if (!window.confirm('Hapus jadwal tambahan ini?')) return;
    setAdditionalSchedule((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from('jadwal_kuliah')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Gagal menghapus jadwal tambahan:', error.message);
      fetchAdditionalSchedule();
    }
  };

  // FILTER JADWAL SESUAI MINGGU YANG SEDANG DILIHAT (ACTIVE WEEK)
  const currentFixedList = (fixedSchedule[selectedDay] || []).filter((item) => item.active);
  const currentAdditionalList = additionalSchedule.filter(
    (item) => item.hari === selectedDay && (Number(item.minggu) === Number(activeWeek) || !item.minggu)
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER RINGKASAN & MENU SELEKTOR GANTI MINGGU */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-purple-400">
              JADWAL KULIAH TETAP & TAMBAHAN
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle Smart Chip ter-reset otomatis per minggu. Jadwal tambahan otomatis tersaring berdasar minggu aktif.
          </p>
        </div>

        {/* CONTROLLER SELEKTOR GANTI MINGGU */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-purple-500/30">
            <button
              onClick={() => handleWeekChange(activeWeek - 1)}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-purple-300 transition"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">TAMPILAN</span>
              <select
                value={activeWeek}
                onChange={(e) => handleWeekChange(e.target.value)}
                className="bg-transparent text-xs font-black text-purple-300 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w} className="bg-slate-900 text-white font-bold">
                    Minggu Ke-{w} {w === currentWeek ? '(Saat Ini)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleWeekChange(activeWeek + 1)}
              className="p-1.5 rounded-xl hover:bg-slate-700 text-purple-300 transition"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetChips}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Reset Chip Minggu Ini</span>
          </button>
        </div>
      </div>

      {/* NAVIGASI HARI */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const hasActiveFixed = (fixedSchedule[day] || []).some((i) => i.active);
          const hasAdditional = additionalSchedule.some(
            (i) => i.hari === day && (Number(i.minggu) === Number(activeWeek) || !i.minggu)
          );

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 flex-shrink-0 border ${
                selectedDay === day
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border-purple-500'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>{day}</span>
              {(hasActiveFixed || hasAdditional) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* TIMELINE MINGGU KE-X */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-purple-400" /> MINGGU KE-{activeWeek} ({selectedDay.toUpperCase()}) - 12 SESI
          </h3>
          <span className="text-[11px] font-bold text-slate-500">1 Sesi = 45 Menit (+5 Min Break)</span>
        </div>

        {/* SMART CHIPS */}
        <div className="flex flex-wrap gap-2 pt-1 pb-3 border-b border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-2">
            Smart Chips (Minggu {activeWeek}):
          </span>
          {(fixedSchedule[selectedDay] || []).length === 0 ? (
            <span className="text-xs text-slate-500 italic">Tidak ada jadwal tetap</span>
          ) : (
            fixedSchedule[selectedDay].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleFixedSchedule(selectedDay, item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                  item.active
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-500 line-through'
                }`}
              >
                <Power className={`w-3.5 h-3.5 ${item.active ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.matkul}</span>
                <span className="text-[10px] opacity-70">Jam {item.jam.join('-')}</span>
              </button>
            ))
          )}
        </div>

        {/* GRID 12 SESI */}
        <div className="space-y-2.5 pt-2">
          {TIME_SLOTS.map((slot) => {
            const fixedMatch = currentFixedList.find((item) => item.jam.includes(slot.jam));
            const additionalMatch = currentAdditionalList.find((item) => {
              const jamArr = Array.isArray(item.kategori_jam) ? item.kategori_jam : [];
              return jamArr.includes(slot.jam);
            });

            const hasClass = fixedMatch || additionalMatch;

            return (
              <div
                key={slot.jam}
                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  hasClass
                    ? 'bg-purple-900/20 border-purple-500/40'
                    : 'bg-slate-800/30 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 p-1.5 text-center rounded-xl bg-slate-800 border border-slate-700/80 flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 block">JAM {slot.jam}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{slot.waktu}</span>
                  </div>
                </div>

                <div className="flex-1 sm:text-right">
                  {fixedMatch && (
                    <div>
                      <span className="text-xs font-black text-white block">{fixedMatch.matkul}</span>
                      <span className="text-[11px] text-purple-300 flex items-center sm:justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {fixedMatch.tempat}
                      </span>
                    </div>
                  )}

                  {additionalMatch && (
                    <div className="mt-1 sm:mt-0">
                      <span className="text-xs font-black text-amber-300 block">
                        [Tambahan Minggu {additionalMatch.minggu || activeWeek}] {additionalMatch.matkul}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center sm:justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" /> {additionalMatch.tempat}
                      </span>
                    </div>
                  )}

                  {!hasClass && (
                    <span className="text-xs font-bold text-slate-600">Kosong</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INPUT / EDIT JADWAL TAMBAHAN */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" /> JADWAL TAMBAHAN / INSIDENTAL (PER MINGGU)
            </h3>
            <p className="text-[11px] text-slate-400">Tambahkan atau perbarui kelas pengganti/tambahan untuk minggu tertentu.</p>
          </div>

          <button
            onClick={() => {
              if (showAddForm) handleCancelForm();
              else setShowAddForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Input Jadwal Tambahan'}</span>
          </button>
        </div>

        {/* FORM TAMBAH / EDIT */}
        {showAddForm && (
          <form onSubmit={handleSaveAdditionalSchedule} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-purple-300">
                {editingId ? 'Edit Jadwal Insidental' : 'Form Tambah Jadwal Insidental'}
              </p>
              {editingId && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Mode Edit
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Minggu Ke-
                </label>
                <div className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={inputMinggu}
                    onChange={(e) => setInputMinggu(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Hari
                </label>
                <select
                  value={inputHari}
                  onChange={(e) => setInputHari(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Mata Kuliah / Acara
                </label>
                <input
                  type="text"
                  placeholder="Misal: Chinese Listening"
                  value={inputMatkul}
                  onChange={(e) => setInputMatkul(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* INPUT INPUT GEDUNG */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-purple-400" /> Gedung
                </label>
                <input
                  type="text"
                  placeholder="Misal: 2 atau Teaching"
                  value={inputGedung}
                  onChange={(e) => setInputGedung(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* INPUT INPUT RUANGAN */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <DoorClosed className="w-3 h-3 text-purple-400" /> Ruangan
                </label>
                <input
                  type="text"
                  placeholder="Misal: 111 atau 1-2"
                  value={inputRuangan}
                  onChange={(e) => setInputRuangan(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Jam Keberapa Saja (Checklist Multi-Pilih)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isChecked = selectedJamList.includes(slot.jam);
                  return (
                    <button
                      key={slot.jam}
                      type="button"
                      onClick={() => handleJamCheckbox(slot.jam)}
                      className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Jam {slot.jam}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
              >
                {editingId ? 'Perbarui Jadwal' : 'Simpan Jadwal Tambahan'}
              </button>
            </div>
          </form>
        )}

        {/* LIST DAFTAR JADWAL TAMBAHAN */}
        <div className="space-y-2.5">
          {additionalSchedule.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-2xl">
              Belum ada jadwal tambahan yang diinput.
            </p>
          ) : (
            additionalSchedule.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl bg-slate-800/40 border transition flex items-center justify-between gap-3 ${
                  Number(item.minggu) === Number(activeWeek) || !item.minggu
                    ? 'border-amber-500/40'
                    : 'border-slate-800 opacity-40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-300">{item.matkul}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Minggu Ke-{item.minggu || activeWeek}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-bold text-white">{item.hari}</span> • {item.tempat} • 
                    <span className="text-purple-300">
                      Jam ke: {Array.isArray(item.kategori_jam) ? item.kategori_jam.join(', ') : '-'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {/* TOMBOL EDIT */}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg transition"
                    title="Edit Jadwal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* TOMBOL HAPUS */}
                  <button
                    onClick={() => handleDeleteAdditional(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
