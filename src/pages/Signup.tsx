import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { SignupData } from '@/types'
import { Mail, User, Lock, Calendar, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

const Signup = () => {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    username: '',
    password: '',
    dateOfBirth: '',
    agreeToTerms: false,
    agreeToCrisisStatement: false,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms & Privacy Policy')
      return
    }

    if (!formData.agreeToCrisisStatement) {
      setError('You must agree to the crisis statement')
      return
    }

    const birthDate = new Date(formData.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age

    if (actualAge < 13) {
      setError('You must be at least 13 years old to use Mind Care')
      return
    }

    setIsLoading(true)

    try {
      await signup(formData)
      navigate('/intake')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className={`max-w-md w-full transition-all duration-700 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        {/* Logo/Illustration Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 animate-bounce-gentle">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-blue-100/50 border border-white p-8 md:p-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                Create your Mind Care account
              </h2>
              <p className="text-slate-500 font-medium">
                Join a safe and supportive mental health community
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-[13px] font-bold text-slate-700 ml-1 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-[13px] font-bold text-slate-700 ml-1 mb-2">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" throws-error="true" className="block text-[13px] font-bold text-slate-700 ml-1 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* DOB Field */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-[13px] font-bold text-slate-700 ml-1 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Must be 13+ years old</p>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="peer h-5 w-5 rounded-lg border-2 border-slate-200 text-primary-600 focus:ring-0 transition-all cursor-pointer opacity-0 absolute z-10"
                    />
                    <div className={`h-5 w-5 rounded-lg border-2 border-slate-200 transition-all flex items-center justify-center ${formData.agreeToTerms ? 'bg-primary-600 border-primary-600' : 'bg-white group-hover:border-primary-400'}`}>
                      {formData.agreeToTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 leading-tight">
                    I agree to the <Link to="/terms" className="text-primary-600 font-bold hover:underline">Terms & Privacy Policy</Link>
                  </span>
                </label>

                <label className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center h-5">
                    <input
                      id="agreeToCrisisStatement"
                      type="checkbox"
                      checked={formData.agreeToCrisisStatement}
                      onChange={(e) => setFormData({ ...formData, agreeToCrisisStatement: e.target.checked })}
                      className="peer h-5 w-5 rounded-lg border-2 border-slate-200 text-primary-600 focus:ring-0 transition-all cursor-pointer opacity-0 absolute z-10"
                    />
                    <div className={`h-5 w-5 rounded-lg border-2 border-slate-200 transition-all flex items-center justify-center shrink-0 ${formData.agreeToCrisisStatement ? 'bg-primary-600 border-primary-600' : 'bg-white group-hover:border-primary-400'}`}>
                      {formData.agreeToCrisisStatement && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 leading-tight">
                    I confirm that I am not currently in crisis or planning to harm myself or others
                  </span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex items-center justify-center py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-base font-black rounded-2xl shadow-xl shadow-primary-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-black hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Subtle Background Decoration */}
          <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50 select-none pointer-events-none" />
          <div className="absolute bottom-0 left-0 -m-8 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 select-none pointer-events-none" />
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs font-semibold uppercase tracking-widest pointer-events-none">
          SECURE & CONFIDENTIAL • © 2026 Mind Care
        </p>
      </div>
    </div>
  )
}

export default Signup





