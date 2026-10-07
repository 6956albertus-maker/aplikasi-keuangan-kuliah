import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data transaksi dari jadual 'transaksi'
  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching transaksi:', error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Tambah transaksi baharu
  const addTransaction = async (newTx) => {
    const { data, error } = await supabase
      .from('transaksi')
      .insert([newTx])
      .select();

    if (error) {
      console.error('Error adding transaction:', error.message);
      alert('Gagal menyimpan transaksi: ' + error.message);
    } else if (data) {
      setTransactions((prev) => [data[0], ...prev]);
    }
  };

  // Padam transaksi
  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transaksi')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error.message);
    } else {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
  };

  return { transactions, loading, addTransaction, deleteTransaction, fetchTransactions };
}
