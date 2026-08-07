import { AlertTriangle } from 'lucide-react'
import logo from '@/assets/logo.png'

export function ConfigMissingScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-ink-50 px-6 text-center">
      <img src={logo} alt="Cappi Barbería" className="h-12 w-auto object-contain" />

      <div className="flex size-14 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle className="size-6 text-amber-600" />
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-semibold text-ink-900">Sitio en configuración</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          Todavía no se conectó la base de datos. Volvé a pasar en un rato — mientras tanto podés
          escribirnos directamente.
        </p>
      </div>

      {import.meta.env.DEV && (
        <p className="max-w-md rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          (Solo en desarrollo) Faltan <code>VITE_SUPABASE_URL</code> y/o{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>. Local: completá{' '}
          <code>frontend/.env.local</code>. En Vercel: Project Settings → Environment Variables →
          Redeploy.
        </p>
      )}
    </div>
  )
}
