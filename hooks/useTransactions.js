import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data transaksi dari Supabase
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Tambah Transaksi
  const addTransaction = async (newTx) => {
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .insert([
          {
            tipe: newTx.tipe,
            keterangan: newTx.keterangan,
            nominal_yuan: parseFloat(newTx.nominal_yuan),
            tanggal: newTx.tanggal,
            metode: newTx.metode || 'Cash',
            kategori: newTx.kategori,
          },
        ])
        .select();

      if (error) {
        alert('Gagal menyimpan transaksi: ' + error.message);
        console.error('Error adding transaction:', error);
      } else if (data && data.length > 0) {
        setTransactions((prev) => [data[0], ...prev]);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // 3. Edit / Kemaskini Transaksi
  const editTransaction = async (updatedTx) => {
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .update({
          tipe: updatedTx.tipe,
          keterangan: updatedTx.keterangan,
          nominal_yuan: parseFloat(updatedTx.nominal_yuan),
          tanggal: updatedTx.tanggal,
          metode: updatedTx.metode || 'Cash',
          kategori: updatedTx.kategori,
        })
        .eq('id', updatedTx.id)
        .select();

      if (error) {
        alert('Gagal mengedit transaksi: ' + error.message);
        console.error('Error updating transaction:', error);
      } else if (data && data.length > 0) {
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === updatedTx.id ? data[0] : tx))
        );
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // 4. Hapus Transaksi
  const deleteTransaction = async (id) => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Gagal menghapus transaksi: ' + error.message);
        console.error('Error deleting transaction:', error);
      } else {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // 5. Reset Semua Transaksi
  const resetTransactions = async () => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hapus semua rekod

      if (error) {
        alert('Gagal mereset data: ' + error.message);
        console.error('Error resetting transactions:', error);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    resetTransactions,
    fetchTransactions,
  };
}
