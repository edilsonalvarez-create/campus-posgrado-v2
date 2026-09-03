import { BrowserRouter, Routes, Route, Navigate, Suspense, lazy } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useAuthStore } from './state/store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'

// Lazy load pages
const CourseView = lazy(() => import('./pages/CourseView'))
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })))
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard').then(m => ({ default: m.InstructorDashboard })))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 }
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
