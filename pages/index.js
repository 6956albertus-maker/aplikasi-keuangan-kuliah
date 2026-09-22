import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [activeTab, setActiveTab] = useState('utama')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([
    { id: 1, title: 'Ujian Tengah Semester', date: '2026-09-25', type: 'kuliah' },
    { id: 2, title: 'Bayar SPP Bulanan', date: '2026-09-30', type: 'pembayaran' }
  ])
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')

  const handleAddEvent = (e) => {
    e.preventDefault()
    if (!newEventTitle || !newEventDate) return
    setEvents([...events, { id: Date.now(), title: newEventTitle, date: newEventDate, type: 'kuliah' }])
    setNewEventTitle('')
    setNewEventDate('')
  }

  // Kalender Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Manager</h1>
            <p className="text-sm text-slate-500">Keuangan, Kuliah & Pembayaran</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
            1 RMB = Rp 2.200
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex space-x-2 border-b border-slate-200 pb-2">
          {['utama', 'keuangan', 'kuliah', 'pembayaran'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Kalender Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">📅 Kalender Agenda Kuliah</h2>
            <span className="text-sm font-semibold text-slate-600">
              {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Grid Kalender */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="h-16 bg-slate-50/50 rounded-xl"></div>
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = events.filter((e) => e.date === dateStr)

              return (
                <div key={day} className="h-16 p-1 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between hover:border-blue-300 transition">
                  <span className="text-xs font-bold text-slate-600">{day}</span>
                  <div className="space-y-1">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate font-medium">
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Form Tambah Agenda */}
          <form onSubmit={handleAddEvent} className="mt-6 flex flex-wrap md:flex-nowrap gap-3">
            <input
              type="text"
              placeholder="Tambah agenda baru..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
            >
              + Tambah Agenda
            </button>
          </form>
        </section>

      </div>
    </div>
  )
}
