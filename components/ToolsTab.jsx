import React from 'react';
import { Clock, GraduationCap, StickyNote } from 'lucide-react';

export default function ToolsTab({
  darkMode,
  isFullscreen,
  pomoMode,
  pomoTime,
  pomoActive,
  setPomoActive,
  setPomoTime,
  setPomoMode,
  calculateGPA,
  gpaCourses,
  stickyNote,
  setStickyNote,
}) {
  if (isFullscreen) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pomodoro Timer */}
      <div
        className={`${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } p-4 rounded-2xl border shadow-sm space-y-3`}
      >
        <h3 className="font-bold text-xs flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>
            Timer Fokus Pomodoro ({pomoMode === 'work' ? 'Sesi Fokus' : 'Istirahat'})
          </span>
        </h3>
        <div className="text-center py-2">
          <p className="text-3xl font-mono font-black text-amber-500">
            {Math.floor(pomoTime / 60)
              .toString()
              .padStart(2, '0')}
            :{(pomoTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPomoActive(!pomoActive)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-white transition ${
              pomoActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {pomoActive ? 'Pause' : 'Mulai Fokus'}
          </button>
          <button
            onClick={() => {
              setPomoActive(false);
              setPomoTime(25 * 60);
              setPomoMode('work');
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculator GPA / IPK */}
      <div
        className={`${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } p-4 rounded-2xl border shadow-sm space-y-3`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span>Kalkulator Estimasi IPK</span>
          </h3>
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg">
            IPK: {calculateGPA()}
          </span>
        </div>
        <div className="space-y-2 text-xs">
          {gpaCourses.map((course) => (
            <div
              key={course.id}
              className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <span className="font-medium">{course.name}</span>
              <span className="text-slate-400">
                {course.sks} SKS • Nilai: {course.gpa}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Notes */}
      <div
        className={`${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } p-4 rounded-2xl border shadow-sm space-y-2 md:col-span-2`}
      >
        <h3 className="font-bold text-xs flex items-center gap-1.5">
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span>Catatan Cepat (Sticky Note)</span>
        </h3>
        <textarea
          value={stickyNote}
          onChange={(e) => setStickyNote(e.target.value)}
          placeholder="Tulis catatan sementara, nomor penting, atau instruksi di sini..."
          rows={3}
          className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-amber-50/50 dark:bg-slate-800 dark:text-white resize-none"
        ></textarea>
      </div>
    </div>
  );
}
