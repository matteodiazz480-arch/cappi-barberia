import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Spinner } from '@/components/ui/Spinner'
import { SplashScreen } from '@/components/SplashScreen'
import { ConfigMissingScreen } from '@/components/ConfigMissingScreen'
import { isSupabaseConfigured } from '@/api/supabase'

const MIN_SPLASH_DURATION_MS = 1400

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const BookingPage = lazy(() => import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })))
const VideosPage = lazy(() => import('@/pages/VideosPage').then((m) => ({ default: m.VideosPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminAgendaPage = lazy(() =>
  import('@/pages/admin/AdminAgendaPage').then((m) => ({ default: m.AdminAgendaPage }))
)
const AdminClientsPage = lazy(() =>
  import('@/pages/admin/AdminClientsPage').then((m) => ({ default: m.AdminClientsPage }))
)
const AdminServicesPage = lazy(() =>
  import('@/pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage }))
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
)

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), MIN_SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!isSupabaseConfigured) {
    return <ConfigMissingScreen />
  }

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>

      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/reservar" element={<BookingPage />} />
            <Route path="/videos" element={<VideosPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="agenda" element={<AdminAgendaPage />} />
            <Route path="clientes" element={<AdminClientsPage />} />
            <Route path="servicios" element={<AdminServicesPage />} />
            <Route path="configuracion" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
