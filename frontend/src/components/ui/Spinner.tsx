import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-10" role="status" aria-label="Cargando">
      <Loader2 className={cn('size-6 animate-spin text-ink-400', className)} />
    </div>
  )
}
