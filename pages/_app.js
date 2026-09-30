import '../styles/globals.css'
import BCAExchangeRateCard from '../components/BCAExchangeRateCard' // Sesuaikan path komponen Anda

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {/* Kotak Kurs BCA yang akan muncul global / di bagian atas */}
      <div className="w-full max-w-md mb-6">
        <BCAExchangeRateCard />
      </div>

      {/* Konten Halaman Utama */}
      <main className="w-full max-w-4xl">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
