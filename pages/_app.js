import '../styles/globals.css'

// Komponen Kotak Kurs BCA didefinisikan langsung di sini
function BCAExchangeRateCard() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 text-gray-800">
      <h3 className="font-bold text-lg mb-2 text-blue-600">Kurs BCA</h3>
      <div className="flex justify-between items-center text-sm border-t pt-2">
        <span>USD / IDR</span>
        <span className="font-semibold text-green-600">Beli: Rp 15.400 | Jual: Rp 15.600</span>
      </div>
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Kotak Kurs BCA */}
      <div className="max-w-md mx-auto mb-6">
        <BCAExchangeRateCard />
      </div>

      {/* Halaman Utama */}
      <main className="max-w-4xl mx-auto">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
