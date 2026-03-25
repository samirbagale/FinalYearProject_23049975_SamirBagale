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
        setError('Incorrect email/username or password. Please try again or reset your password.');
      } else if (err.message.includes('network')) {
        setError('Connection error. Please check your internet.');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Brand / Header */}
        <div className="text-center mb-8">
          {/* Optional logo
          <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-lg">MC</span>
          </div> 
          */}
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to <span className="font-semibold text-gray-700">Mind Care</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-8">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email / Username */}
            <div className="space-y-1">
              <label
                htmlFor="emailOrUsername"
                className="block text-sm font-medium text-gray-700"
              >
                Email or username
              </label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                required
                autoComplete="username"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="you@example.com"
                value={formData.emailOrUsername}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Remember me / actions */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
