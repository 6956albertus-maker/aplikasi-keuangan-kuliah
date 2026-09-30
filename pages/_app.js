import '../styles/globals.css'
import BCAExchangeRateCard from '../components/BCAExchangeRateCard'

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Kotak Kurs CNY Realtime */}
      <BCAExchangeRateCard />

      {/* Konten Utama Aplikasi */}
      <main className="max-w-4xl mx-auto mt-4">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
