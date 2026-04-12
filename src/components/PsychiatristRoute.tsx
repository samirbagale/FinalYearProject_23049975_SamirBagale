import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface PsychiatristRouteProps {
    children: ReactNode
}

const PsychiatristRoute = ({ children }: PsychiatristRouteProps) => {
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

    // Logged in but not psychiatrist -> Home
    if (user?.role !== 'psychiatrist') {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export default PsychiatristRoute
