import Header from './Header'
import Footer from './Footer'
import NetworkStatus from './NetworkStatus'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NetworkStatus />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}