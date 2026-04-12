import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface AdminRouteProps {
    children: ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    // Not logged in -> Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Logged in but not admin -> Home (or 403 page)
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export default AdminRoute
