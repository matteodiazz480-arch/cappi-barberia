import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useClientAuth } from '@/context/ClientAuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedClientRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useClientAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/cuenta/login" replace />
  }

  return children
}
