import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Sesuaikan path ke supabaseClient Anda

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data transaksi dari Supabase
  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Fungsi Tambah Transaksi
  const addTransaction = async (newTx) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([newTx])
      .select();

    if (error) {
      console.error('Error adding transaction:', error);
      return { success: false, error };
    }
    
    setTransactions((prev) => [data[0], ...prev]);
    return { success: true, data: data[0] };
  };

  // 3. Fungsi Hapus Transaksi
  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }

    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    return true;
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
  };
}
