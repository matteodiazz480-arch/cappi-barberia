import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'default' | 'accent'
}

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div
        className={
          tone === 'accent'
            ? 'flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700'
            : 'flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ink-100 text-ink-700'
        }
      >
        <Icon className="size-5" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight text-ink-900">{value}</p>
        <p className="truncate text-sm text-ink-500">{label}</p>
      </div>
    </Card>
  )
}
