import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-200 px-6 py-14 text-center',
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-ink-100">
        <Icon className="size-6 text-ink-500" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-ink-800">{title}</p>
        {description && <p className="text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
