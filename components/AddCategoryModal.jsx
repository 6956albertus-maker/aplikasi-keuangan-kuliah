import React from 'react';
import { X } from 'lucide-react';

export default function AddCategoryModal({
  showAddCategoryModal,
  setShowAddCategoryModal,
  handleAddCategory,
  newCategoryInput,
  setNewCategoryInput,
  darkMode,
}) {
  if (!showAddCategoryModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleAddCategory}
        className={`${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white'
        } p-5 rounded-2xl max-w-sm w-full space-y-4 border shadow-xl`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs">Tambah Kategori Pengeluaran</h3>
          <button
            type="button"
            onClick={() => setShowAddCategoryModal(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Nama Kategori Baru..."
          value={newCategoryInput}
          onChange={(e) => setNewCategoryInput(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
          required
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddCategoryModal(false)}
            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
