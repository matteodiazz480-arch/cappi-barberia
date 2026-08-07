import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminMobileNav } from '@/components/layout/AdminMobileNav'
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications'

export function AdminLayout() {
  useAppointmentNotifications()

  return (
    <div className="flex min-h-svh bg-ink-50">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>
      <AdminMobileNav />
    </div>
  )
}
