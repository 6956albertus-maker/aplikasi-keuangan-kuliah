import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  Coins, 
  StickyNote, 
  Plus, 
  Trash2, 
  Sparkles,
  GraduationCap,
  Calendar,
  Timer,
  Mail,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export default function ToolsTab({ kursYuan = 2671 }) {
  // 1. STATE KALKULATOR GPA / IPK
  const [courses, setCourses] = useState([
    { id: 1, name: 'Chinese Comprehensive', sks: 4, grade: 4.0 },
    { id: 2, name: 'Chinese Listening', sks: 2, grade: 3.5 },
  ]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: '', sks: 2, grade: 4.0 }]);
  };

  const updateCourse = (id, field, value) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const deleteCourse = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const totalSKS = courses.reduce((acc, curr) => acc + Number(curr.sks || 0), 0);
  const totalBobot = courses.reduce(
    (acc, curr) => acc + Number(curr.sks || 0) * Number(curr.grade || 0),
    0
  );
  const gpa = totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : '0.00';

  // 2. STATE KALKULATOR SKOR HSK
  const [scoreListening, setScoreListening] = useState(70);
  const [scoreReading, setScoreReading] = useState(75);
  const [scoreWriting, setScoreWriting] = useState(65);

  const totalHsk = Number(scoreListening) + Number(scoreReading) + Number(scoreWriting);
  const isHskPass = totalHsk >= 180;

  // 3. STATE KONVERTER KURS CEPAT
  const [inputCny, setInputCny] = useState(100);
  const [inputIdr, setInputIdr] = useState(100 * kursYuan);

  const handleCnyChange = (val) => {
    setInputCny(val);
    setInputIdr(val * kursYuan);
  };

  const handleIdrChange = (val) => {
    setInputIdr(val);
    setInputCny((val / kursYuan).toFixed(2));
  };

  // 4. STATE STICKY NOTES
  const [notes, setNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('student_manager_notes');
      return saved ? JSON.parse(saved) : ['Ingat daftar ujian HSK bulan depan!'];
    }
    return [];
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem('student_manager_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote, ...notes]);
    setNewNote('');
  };

  const deleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // 5. TOOL BARU: PENGUKUR PROGRESS SEMESTER
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2027-01-15');

  const calculateSemesterProgress = () => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return { percent: 0, daysLeft: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) };
    if (now > end) return { percent: 100, daysLeft: 0 };

    const total = end - start;
    const current = now - start;
    const percent = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    return { percent, daysLeft };
  };

  const semProgress = calculateSemesterProgress();

  // 6. TOOL BARU: TIMER POMODORO FOCUS
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      setCompletedSessions((prev) => prev + 1);
      alert('Sesi Fokus 25 Menit Selesai! Waktunya Istirahat 5 Menit.');
      setSecondsLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(25 * 60);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 7. TOOL BARU: GENERATOR DRAF EMAIL DOSEN / LAOSHI
  const [emailType, setEmailType] = useState('izin');
  const [studentName, setStudentName] = useState('Siswa');
  const [copied, setCopied] = useState(false);

  const getEmailTemplate = () => {
    if (emailType === 'izin') {
      return `Subject: 请假条 - ${studentName}\n\n尊敬的老师：\n您好！我是 ${studentName}。因为身体不适，我申请请假，无法参加今天的课程。希望老师批准。谢谢老师！\n\n此致\n敬礼\n${studentName}`;
    } else if (emailType === 'tugas') {
      return `Subject: 作业提交 - ${studentName}\n\n尊敬的老师：\n您好！我是 ${studentName}。附件是我今天的作业，请您查收。如果有什么问题，请老师指正。非常感谢！\n\n此致\n敬礼\n${studentName}`;
    } else {
      return `Subject: 关于课程内容的咨询 - ${studentName}\n\n尊敬的老师：\n您好！我是 ${studentName}。在复习今天的课程内容时，我有一些地方不太理解，想向老师请教。请问老师什么时候方便？谢谢老师！\n\n此致\n敬礼\n${studentName}`;
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getEmailTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TOOLS */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> STUDENT PRODUCTIVITY TOOLS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Koleksi alat bantu akademik, simulasi HSK, timer fokus, generator email laoshi, dan konversi kurs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOOL 1: KALKULATOR GPA / IPK */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Kalkulator IPK / GPA
              </h3>
            </div>
            <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black">
              IPK: {gpa}
            </div>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {courses.map((course) => (
              <div key={course.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nama Matkul"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  className="col-span-6 p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="SKS"
                  value={course.sks}
                  onChange={(e) => updateCourse(course.id, 'sks', e.target.value)}
                  className="col-span-2 p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white text-center"
                />
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', parseFloat(e.target.value))}
                  className="col-span-3 p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value={4.0}>A (4.0)</option>
                  <option value={3.5}>A- (3.5)</option>
                  <option value={3.0}>B (3.0)</option>
                  <option value={2.5}>B- (2.5)</option>
                  <option value={2.0}>C (2.0)</option>
                  <option value={1.0}>D (1.0)</option>
                </select>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="col-span-1 p-2 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCourse}
            className="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Tambah Mata Kuliah
          </button>
        </div>

        {/* TOOL 2: SIMULASI SKOR HSK */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Simulasi Skor HSK
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black border ${
                isHskPass
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {isHskPass ? 'LULUS (≥180)' : 'TIDAK LULUS (<180)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Listening (听力)
              </label>
              <input
                type="number"
                max="100"
                value={scoreListening}
                onChange={(e) => setScoreListening(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Reading (阅读)
              </label>
              <input
                type="number"
                max="100"
                value={scoreReading}
                onChange={(e) => setScoreReading(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                Writing (书写)
              </label>
              <input
                type="number"
                max="100"
                value={scoreWriting}
                onChange={(e) => setScoreWriting(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold text-center"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">Total Skor Kumulatif:</span>
            <span className="text-base font-black text-indigo-300">{totalHsk} / 300</span>
          </div>
        </div>

        {/* TOOL 3: KONVERTER KURS RAPID (CNY - IDR) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Konverter Kurs Instan (Supabase Synced)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Yuan (CNY / ¥)
              </label>
              <input
                type="number"
                value={inputCny}
                onChange={(e) => handleCnyChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-black text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Rupiah (IDR / Rp)
              </label>
              <input
                type="number"
                value={inputIdr}
                onChange={(e) => handleIdrChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-black text-sm"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic text-right">
            *1 CNY = Rp {kursYuan.toLocaleString('id-ID')} (Data Supabase)
          </p>
        </div>

        {/* TOOL 4: STICKY NOTES */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <StickyNote className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Catatan Tempel (Sticky Notes)
            </h3>
          </div>

          <form onSubmit={addNote} className="flex gap-2">
            <input
              type="text"
              placeholder="Ketik catatan baru..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
            >
              Tambah
            </button>
          </form>

          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {notes.map((note, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex justify-between items-center"
              >
                <span>{note}</span>
                <button
                  onClick={() => deleteNote(index)}
                  className="text-amber-400/60 hover:text-rose-400 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TOOL BARU 5: TIMER FOKUS POMODORO */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-rose-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Timer Fokus Belajar (Pomodoro 25 Mins)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Sesi Selesai: <span className="text-rose-400 font-black">{completedSessions}</span>
            </span>
          </div>

          <div className="text-center py-2 space-y-3">
            <span className="text-4xl font-black text-white font-mono tracking-widest block">
              {formatTimer(secondsLeft)}
            </span>

            <div className="flex justify-center gap-2">
              <button
                onClick={toggleTimer}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? 'Jeda' : 'Mulai Fokus'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* TOOL BARU 6: PENGUKUR PROGRESS SEMESTER */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Progress & Hitung Mundur Liburan
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Mulai Semester</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Akhir Semester/Libur</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Progress Semester:</span>
              <span className="text-cyan-400 font-black">{semProgress.percent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${semProgress.percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right pt-1">
              Sisa Waktu: <span className="font-bold text-white">{semProgress.daysLeft} Hari</span> Menuju Akhir Semester
            </p>
          </div>
        </div>

      </div>

      {/* TOOL BARU 7: GENERATOR EMAIL DOSEN/LAOSHI (FULL WIDTH) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Generator Email Dosen / Laoshi (Mandarin Email Template)
              </h3>
              <p className="text-[11px] text-slate-400">Pilih keperluan untuk membuat draf surat formal bahasa Mandarin.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nama Anda"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
            >
              <option value="izin">Izin Sakit (请假条)</option>
              <option value="tugas">Kirim Tugas (作业提交)</option>
              <option value="tanya">Tanya Materi (课程咨询)</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap">
            {getEmailTemplate()}
          </pre>
          <button
            onClick={handleCopyEmail}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Draf'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
