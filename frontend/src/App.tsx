import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './state/store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'

// Lazy load pages
const CourseView = lazy(() => import('./pages/CourseView'))
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })))
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard').then(m => ({ default: m.InstructorDashboard })))
const ExploreCoursesPage = lazy(() => import('./pages/ExploreCoursesPage').then(m => ({ default: m.ExploreCoursesPage })))
const MasterIEPPage = lazy(() => import('./pages/MasterIEPPage').then(m => ({ default: m.MasterIEPPage })))
const NativeCoursesPage = lazy(() => import('./pages/NativeCoursesPage').then(m => ({ default: m.NativeCoursesPage })))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 }
  }
})

function App() {
  const { user } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explore" element={<Suspense fallback={<LoadingSpinner />}><ExploreCoursesPage /></Suspense>} />
              <Route path="/master-iep" element={<Suspense fallback={<LoadingSpinner />}><MasterIEPPage /></Suspense>} />
              <Route path="/native-courses" element={<Suspense fallback={<LoadingSpinner />}><NativeCoursesPage /></Suspense>} />
              <Route path="/native-courses/:courseId" element={<Suspense fallback={<LoadingSpinner />}><NativeCoursesPage /></Suspense>} />
              <Route path="/courses/:courseId" element={<Suspense fallback={<LoadingSpinner />}><CourseView /></Suspense>} />
              <Route path="/courses/:courseId/submissions/:resourceId?" element={<Suspense fallback={<LoadingSpinner />}><SubmissionsPage /></Suspense>} />
              <Route path="/instructor" element={<Suspense fallback={<LoadingSpinner />}><InstructorDashboard /></Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
