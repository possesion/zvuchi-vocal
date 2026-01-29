import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function NotFound() {
  return (
    <div className="relative min-h-screen font-exo2">
      <Header />
      <main className="w-full flex-1 primary-bg overflow-x-hidden">
        <div className="container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-3xl font-bold mb-6">Страница не найдена</h2>
            <p className="text-xl mb-8 text-gray-300">
              К сожалению, запрашиваемая страница не существует или была перемещена.
            </p>
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-sm transition-colors duration-200"
              >
                Вернуться на главную
              </Link>
              <div className="text-gray-400">
                <p>Или свяжитесь с нами:</p>
                <a 
                  href="tel:+79779675001" 
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  +7 (977) 967-50-01
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}