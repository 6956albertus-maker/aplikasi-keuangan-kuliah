import React from 'react';
import { CheckCircle2, Square, Edit2, Trash2 } from 'lucide-react';
import { formatYuan, formatIDR } from '../lib/utils'; // Sesuaikan path

export default function PaymentTab({
  payments,
  selectedPaymentYear,
  darkMode,
  togglePaymentStatus,
  setEditingPayment,
  deletePayment,
}) {
  const filteredPayments = payments.filter(
    (p) => p.kategori_tahun === selectedPaymentYear
  );

  return (
    <div className="space-y-2">
      {filteredPayments.map((payment) => (
        <div
          key={payment.id}
          className={`p-3.5 border rounded-2xl flex justify-between items-center transition ${
            payment.sudah_dibayar
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
              : darkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => togglePaymentStatus(payment.id, payment.sudah_dibayar)}
              className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition"
            >
              {payment.sudah_dibayar ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              )}
            </button>
            <div>
              <p
                className={`text-xs font-bold ${
                  payment.sudah_dibayar
                    ? 'line-through text-slate-400'
                    : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {payment.nama_tagihan}
              </p>
              <p className="text-[10px] text-slate-400">
                {payment.tenggat_waktu
                  ? `Tenggat: ${payment.tenggat_waktu}`
                  : 'Tanpa Tenggat'}
                {payment.sudah_dibayar && payment.tanggal_pembayaran && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                    • Dibayar: {payment.tanggal_pembayaran}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                {formatYuan(payment.jumlah_yuan)}
              </p>
              <p className="text-[9px] text-slate-400">
                {formatIDR(payment.jumlah_yuan)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingPayment(payment)}
                className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deletePayment(payment.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
