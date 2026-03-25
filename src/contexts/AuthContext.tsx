import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginData, SignupData } from '@/types'

const API_Base = 'http://127.0.0.1:5000/api/auth'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginData) => Promise<AuthUser>
  signup: (data: SignupData) => Promise<AuthUser>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('mindcare_user')
        const storedToken = localStorage.getItem('token')

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser))
        } else {
          // If missing token or user, clean up
          localStorage.removeItem('mindcare_user')
          localStorage.removeItem('token')
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (data: LoginData): Promise<AuthUser> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_Base}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: data.emailOrUsername,
          password: data.password
        }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.error || 'Login failed')
      }

      const { user, token } = resData

      // Format user for frontend
      const authUser: AuthUser = {
        id: user._id,
        email: user.email,
        username: user.username,
        dateOfBirth: new Date(), // Mock DOB if not returned by backend yet
        role: user.role,
        isPremium: user.isPremium,
        createdAt: new Date(user.createdAt),
      }

      setUser(authUser)
      localStorage.setItem('mindcare_user', JSON.stringify(authUser))
      localStorage.setItem('token', token) // Store the JWT token!
      
      return authUser
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupData): Promise<AuthUser> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_Base}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password
        }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.error || 'Signup failed')
      }

      const { user, token } = resData

      const authUser: AuthUser = {
        id: user._id,
        email: user.email,
        username: user.username,
        dateOfBirth: new Date(data.dateOfBirth),
        role: user.role,
        isPremium: user.isPremium,
        createdAt: new Date(user.createdAt),
      }

      setUser(authUser)
      localStorage.setItem('mindcare_user', JSON.stringify(authUser))
      localStorage.setItem('token', token)

      return authUser
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mindcare_user')
    localStorage.removeItem('token')
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_Base}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const resData = await response.json()
      if (resData.success) {
        const u = resData.data
        const authUser: AuthUser = {
          id: u._id,
          email: u.email,
          username: u.username,
          dateOfBirth: new Date(),
          role: u.role,
          isPremium: u.isPremium,
          createdAt: new Date(u.createdAt)
        }
        setUser(authUser)
        localStorage.setItem('mindcare_user', JSON.stringify(authUser))
      }
    } catch (e) {
      console.error("Failed to refresh user", e)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
