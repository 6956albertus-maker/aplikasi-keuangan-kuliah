import React from 'react';
import { X, Plus } from 'lucide-react';

export default function AddCategoryModal({
  showAddCategoryModal,
  setShowAddCategoryModal,
  handleAddCategory,
  newCategoryInput,
  setNewCategoryInput,
}) {
  if (!showAddCategoryModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative">
        <button
          onClick={() => setShowAddCategoryModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-extrabold text-base text-purple-400 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baharu</span>
        </h3>

        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Nama Kategori</label>
            <input
              type="text"
              placeholder="Contoh: Baju / Yuran Lab"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-700 bg-slate-800/80 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddCategoryModal(false)}
              className="flex-1 py-3 rounded-2xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:opacity-90 transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
