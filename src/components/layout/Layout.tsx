import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const standaloneRoutes = ['/psychiatrist-dashboard', '/admin', '/video-session']
  const isStandalone = standaloneRoutes.includes(location.pathname)
  const isChatPage = location.pathname === '/chat'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isStandalone && <Navbar />}
      <main className={`flex-grow flex flex-col ${!isStandalone ? 'pt-24' : ''}`}>
        <div className={`flex-grow flex flex-col ${(!isStandalone && !isChatPage) ? 'container mx-auto px-4 py-8' : ''}`}>
          {children}
        </div>
      </main>
      {(!isStandalone && !isChatPage) && <Footer />}
    </div>
  )
}

export default Layout





