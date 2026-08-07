import { Outlet } from 'react-router-dom'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-ink-50">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
