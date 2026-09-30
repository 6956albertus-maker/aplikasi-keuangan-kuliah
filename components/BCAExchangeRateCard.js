import React, { useState, useEffect } from 'react';

export default function BCAExchangeRateCard() {
  const [cnyRate, setCnyRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(false);
    try {
      // Mengambil data kurs realtime CNY ke IDR dari API gratis
      const response = await fetch('https://open.er-api.com/v6/latest/CNY');
      const data = await response.json();
      
      if (data && data.rates && data.rates.IDR) {
        const rate = data.rates.IDR;
        // Estimasi spread Beli / Jual (~1% dari rate pasar)
        setCnyRate({
          rate: rate.toFixed(2),
          buy: (rate * 0.99).toFixed(2),
          sell: (rate * 1.01).toFixed(2),
        });
        
        // Format waktu perbaharuan terakhir
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    // Refresh otomatis setiap 60 detik
    const interval = setInterval(fetchExchangeRate, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 my-4 w-full max-w-sm mx-auto font-sans">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <h2 className="text-base font-bold text-blue-700 flex items-center gap-2">
          <span className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs font-extrabold">CNY</span>
          Kurs Yuan Realtime
        </h2>
        <span className="text-[10px] text-gray-400">
          {lastUpdated ? `Update: ${lastUpdated}` : 'Memuat...'}
        </span>
      </div>

      {loading && !cnyRate ? (
        <div className="py-4 text-center text-sm text-gray-500 animate-pulse">
          Mengambil data kurs terbaru...
        </div>
      ) : error ? (
        <div className="py-2 text-center text-xs text-red-500">
          Gagal memuat kurs. <button onClick={fetchExchangeRate} className="underline">Coba lagi</button>
        </div>
      ) : (
        <div>
          <div className="text-center my-2">
            <span className="text-xs text-gray-500 block">1 CNY / IDR</span>
            <span className="text-2xl font-extrabold text-gray-800">Rp {Number(cnyRate.rate).toLocaleString('id-ID')}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100 text-center text-xs">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <span className="text-emerald-700 block font-medium">Beli</span>
              <span className="font-bold text-emerald-800">Rp {Number(cnyRate.buy).toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg">
              <span className="text-rose-700 block font-medium">Jual</span>
              <span className="font-bold text-rose-800">Rp {Number(cnyRate.sell).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
