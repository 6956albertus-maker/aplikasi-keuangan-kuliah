import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  BookOpen, 
  CalendarDays, 
  Power, 
  RotateCcw,
  Check,
  PlusCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// DAFTAR WAKTU TEPAT PER JAM PELAJARAN (12 SESI)
const TIME_SLOTS = [
  { jam: 1,  waktu: '08:00 - 08:45' },
  { jam: 2,  waktu: '08:55 - 09:40' },
  { jam: 3,  waktu: '09:50 - 10:35' },
  { jam: 4,  waktu: '10:45 - 11:30' },
  // Istirahat 1: 12:10 - 14:00
  { jam: 5,  waktu: '14:00 - 14:45' },
  { jam: 6,  waktu: '14:55 - 15:40' },
  { jam: 7,  waktu: '15:50 - 16:35' },
  { jam: 8,  waktu: '16:45 - 17:30' },
  // Istirahat 2: 18:10 - 19:30
  { jam: 9,  waktu: '19:30 - 20:15' },
  { jam: 10, waktu: '20:25 - 21:10' },
  { jam: 11, waktu: '21:20 - 22:05' },
  { jam: 12, waktu: '22:15 - 23:00' },
];

// JADWAL TETAP REVISI TERBARU (HARI KAMIS DIPERBARUI)
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

export default function JadwalKuliahTab() {
  const [selectedDay, setSelectedDay] = useState('Kamis');
  const [fixedSchedule, setFixedSchedule] = useState(INITIAL_FIXED_SCHEDULE);
  const [additionalSchedule, setAdditionalSchedule] = useState([]);
  
  // State Form Input
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputHari, setInputHari] = useState('Kamis');
  const [inputMatkul, setInputMatkul] = useState('');
  const [inputTempat, setInputTempat] = useState('');
  const [selectedJamList, setSelectedJamList] = useState([]);

  useEffect(() => {
    // Selalu perbarui dengan struktur awal yang baru
    const savedChipStatus = localStorage.getItem('fixed_schedule_status_v2');
    if (savedChipStatus) {
      try {
        setFixedSchedule(JSON.parse(savedChipStatus));
      } catch (e) {
        setFixedSchedule(INITIAL_FIXED_SCHEDULE);
      }
    } else {
      setFixedSchedule(INITIAL_FIXED_SCHEDULE);
      localStorage.setItem('fixed_schedule_status_v2', JSON.stringify(INITIAL_FIXED_SCHEDULE));
    }

    fetchAdditionalSchedule();
  }, []);

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
    localStorage.setItem('fixed_schedule_status_v2', JSON.stringify(updated));
  };

  const handleResetChips = () => {
    setFixedSchedule(INITIAL_FIXED_SCHEDULE);
    localStorage.setItem('fixed_schedule_status_v2', JSON.stringify(INITIAL_FIXED_SCHEDULE));
  };

  const handleJamCheckbox = (jamNum) => {
    if (selectedJamList.includes(jamNum)) {
      setSelectedJamList(selectedJamList.filter((j) => j !== jamNum));
    } else {
      setSelectedJamList([...selectedJamList, jamNum].sort((a, b) => a - b));
    }
  };

  const handleAddAdditionalSchedule = async (e) => {
    e.preventDefault();
    if (!inputMatkul || !inputTempat || selectedJamList.length === 0) {
      alert('Mohon isi Mata Kuliah, Tempat, dan pilih minimal 1 Jam Sesi!');
      return;
    }

    const payload = {
      hari: inputHari,
      matkul: inputMatkul,
      tempat: inputTempat,
      kategori_jam: selectedJamList
    };

    const { data, error } = await supabase
      .from('jadwal_kuliah')
      .insert([payload])
      .select();

    if (error) {
      console.error('Gagal menambah jadwal tambahan:', error.message);
      alert('Gagal menyimpan ke database: ' + error.message);
    } else if (data) {
      setAdditionalSchedule((prev) => [...prev, ...data]);
      setInputMatkul('');
      setInputTempat('');
      setSelectedJamList([]);
      setShowAddForm(false);
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

  const currentFixedList = (fixedSchedule[selectedDay] || []).filter((item) => item.active);
  const currentAdditionalList = additionalSchedule.filter((item) => item.hari === selectedDay);

  return (
    <div className="space-y-6">
      {/* HEADER RINGKASAN */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> JADWAL KULIAH TETAP (S/D JULI 2027)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle Smart Chip untuk meliburkan jadwal mingguan secara sementara. Reset otomatis setiap minggu baru.
          </p>
        </div>

        <button
          onClick={handleResetChips}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4 text-purple-400" />
          <span>Reset Chip On</span>
        </button>
      </div>

      {/* NAVIGASI HARI */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const hasActiveFixed = (fixedSchedule[day] || []).some((i) => i.active);
          const hasAdditional = additionalSchedule.some((i) => i.hari === day);

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

      {/* TIMELINE 12 SESI */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-purple-400" /> TIMELINE {selectedDay.toUpperCase()} (12 SESI)
          </h3>
          <span className="text-[11px] font-bold text-slate-500">1 Sesi = 45 Menit</span>
        </div>

        {/* SMART CHIPS */}
        <div className="flex flex-wrap gap-2 pt-1 pb-3 border-b border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-2">
            Smart Chips:
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
                        [Tambahan] {additionalMatch.matkul}
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

      {/* INPUT JADWAL TAMBAHAN */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" /> JADWAL TAMBAHAN / INSIDENTAL
            </h3>
            <p className="text-[11px] text-slate-400">Tambah kelas pengganti atau jadwal belajar ekstra.</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Input Jadwal Tambahan</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddAdditionalSchedule} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <p className="text-xs font-bold text-slate-200">Form Tambah Jadwal</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  placeholder="Contoh: Kelas Pengganti HSK"
                  value={inputMatkul}
                  onChange={(e) => setInputMatkul(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tempat / Ruangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung Teaching Ruangan 1-2"
                  value={inputTempat}
                  onChange={(e) => setInputTempat(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
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
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
              >
                Simpan Jadwal Tambahan
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
                className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-amber-300">{item.matkul}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-bold text-white">{item.hari}</span> • {item.tempat} • 
                    <span className="text-purple-300">
                      Jam ke: {Array.isArray(item.kategori_jam) ? item.kategori_jam.join(', ') : '-'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAdditional(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
