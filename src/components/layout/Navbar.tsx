import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Brain, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Activity,
  Heart,
  AlertTriangle,
  Crown,
  Users
} from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const navLinks = [
    { path: '/', label: 'Home', icon: Heart },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/mood-tracking', label: 'Mood Tracking', icon: Activity },
    { path: '/wellness', label: 'Wellness', icon: Sparkles },
    { path: '/emergency', label: 'Emergency', icon: AlertTriangle },
    { path: '/premium', label: 'Premium', icon: Crown },
    { path: '/community', label: 'Community', icon: Users },
  ]

  const adminLinks = user?.role === 'admin' ? [
    { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard }
  ] : user?.role === 'psychiatrist' ? [
    { path: '/psychiatrist-dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ] : []

  const allLinks = [...navLinks, ...adminLinks]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-gray-200/50 py-2' 
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary-200">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-primary-600'
            }`}>
              Mind<span className="text-primary-500">Care</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group flex items-center space-x-1 ${
                  isActive(link.path)
                    ? 'text-primary-700 bg-primary-100/80 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                )}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 pr-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs border border-primary-200 uppercase">
                    {user?.username?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-slide-down">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                      </div>

                      {adminLinks.map(link => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <link.icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-all duration-200 shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-[80vh] border-t' : 'max-h-0'
        }`}
      >
        <div className="p-4 space-y-1">
          {allLinks.map((link, idx) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 p-4 rounded-xl text-base font-medium transition-all ${
                isActive(link.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ 
                animationDelay: `${idx * 50}ms`,
                animation: isMenuOpen ? 'slideInRight 0.3s ease-out both' : 'none'
              }}
            >
              <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-primary-600' : 'text-gray-400'}`} />
              <span>{link.label}</span>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col space-y-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full p-4 rounded-xl bg-red-50 text-red-600 font-bold text-sm transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full p-4 text-center rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full p-4 text-center rounded-xl bg-primary-600 text-white font-bold transition-transform active:scale-95 shadow-lg shadow-primary-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


