import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState<{ emailOrUsername: string; password: string }>({
    emailOrUsername: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If already logged in, redirect based on role
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'psychiatrist') {
        navigate('/psychiatrist-dashboard')
      } else {
        navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic client-side validation
    if (!formData.emailOrUsername.trim() || !formData.password) {
      setError('Please provide both email/username and password.')
      return
    }

    setIsLoading(true)

    try {
      const user = await login(formData)
      
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'psychiatrist') {
        navigate('/psychiatrist-dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      console.error('Login Error Breakdown:', err);
      // More specific error handling
      if (err.message === 'Invalid credentials') {
        setError('Incorrect email/username or password. Please try again.');
      } else if (err.message.includes('network')) {
        setError('Connection error. Please check your internet.');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const [rememberMe, setRememberMe] = useState(false)

  // Style constants for reusable premium look
  const inputContainerStyle = "group relative transition-all duration-300"
  const inputBaseStyle = "peer block w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-12 py-4 text-sm font-medium text-slate-900 placeholder-transparent transition-all hover:border-slate-200 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
  const labelBaseStyle = "absolute left-12 top-4 -translate-y-7 scale-90 text-xs font-bold text-blue-600 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-slate-400 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:text-blue-600"
  const iconBaseStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"



  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_#f5f3ff_0%,_transparent_40%)]" />
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-blue-100/30 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-purple-100/30 blur-[120px] delay-1000" />

      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-700">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mind Care</span>
            </h1>
            <p className="mt-4 text-base font-bold text-slate-500">
              Your mental sanctuary awaits. Let's begin your journey.
            </p>
          </div>

          {/* Login Card */}
          <div className="overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/80 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-12">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="flex animate-shake items-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm font-bold text-red-600">
                  <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              {/* Email / Username Field */}
              <div className={inputContainerStyle}>
                <div className={iconBaseStyle}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  required
                  placeholder="Email or username"
                  className={inputBaseStyle}
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                />
                <label htmlFor="emailOrUsername" className={labelBaseStyle}>Email or Username</label>
              </div>

              {/* Password Field */}
              <div className={inputContainerStyle}>
                <div className={iconBaseStyle}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className={inputBaseStyle}
                  value={formData.password}
                  onChange={handleChange}
                />
                <label htmlFor="password" className={labelBaseStyle}>Password</label>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="group flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-[#1E90FF]"
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${rememberMe ? 'border-[#1E90FF] bg-[#1E90FF] text-white' : 'border-slate-200 bg-white group-hover:border-[#1E90FF]/30'}`}>
                    {rememberMe && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  Remember me
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ background: 'linear-gradient(to right, #1E90FF, #0077B6)' }}
                className="relative w-full overflow-hidden rounded-[1.25rem] p-4 text-sm font-black text-white shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Connecting...
                  </div>
                ) : 'Sign in'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-bold text-slate-500">
                New to Mind Care? {' '}
                <Link
                  to="/signup"
                  className="relative ml-1 inline-block text-[#1E90FF] transition-colors hover:text-[#0077B6] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#1E90FF] after:transition-all hover:after:w-full"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  )
}

export default Login
