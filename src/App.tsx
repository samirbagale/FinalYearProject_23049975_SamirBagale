import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Chat from './pages/Chat'
import MoodTracking from './pages/MoodTracking'
import Wellness from './pages/Wellness'
import EmergencySupport from './pages/EmergencySupport'
import Premium from './pages/Premium'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Intake from './pages/Intake'
import Community from './pages/Community'
import VideoSession from './pages/VideoSession'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/admin/Dashboard'
import PsychiatristDashboard from './pages/psychiatrist/Dashboard'
import PsychiatristRoute from './components/PsychiatristRoute'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/intake" element={<ProtectedRoute><Intake /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/mood-tracking" element={<ProtectedRoute><MoodTracking /></ProtectedRoute>} />
            <Route path="/wellness" element={<ProtectedRoute><Wellness /></ProtectedRoute>} />
            <Route path="/emergency" element={<EmergencySupport />} />
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/video-session" element={<ProtectedRoute><VideoSession /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/psychiatrist-dashboard" element={<PsychiatristRoute><PsychiatristDashboard /></PsychiatristRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App

