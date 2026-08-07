import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-ink-50 px-5 text-center">
      <p className="text-6xl font-semibold tracking-tight text-ink-900">404</p>
      <p className="text-ink-500">Esta página no existe.</p>
      <Link to="/">
        <Button className="gap-2">
          <Home className="size-4" />
          Volver al inicio
        </Button>
      </Link>
    </div>
  )
}
