import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CalendarCheck, Users, Clock, DollarSign } from 'lucide-react'
import { getDashboardStats } from '@/services/dashboard.service'
import { StatCard } from '@/components/admin/StatCard'
import { WeeklyChart } from '@/components/admin/WeeklyChart'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPrice, formatTime } from '@/utils/format'

const statusTone = {
  pendiente: 'warning',
  confirmado: 'info',
  completado: 'success',
  cancelado: 'danger',
  no_asistio: 'neutral',
} as const

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500">Resumen general de tu barbería.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Turnos de hoy" value={String(data?.todayCount ?? 0)} icon={CalendarDays} />
        <StatCard label="Turnos del mes" value={String(data?.monthCount ?? 0)} icon={CalendarCheck} />
        <StatCard label="Clientes" value={String(data?.clientsCount ?? 0)} icon={Users} />
        <StatCard
          label="Ingresos de hoy"
          value={formatPrice(data?.todayRevenue ?? 0)}
          icon={DollarSign}
          tone="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyChart />

        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Clock className="size-4" /> Turnos de hoy
          </h3>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {!isLoading && (data?.upcomingToday.length ?? 0) === 0 && (
            <EmptyState icon={CalendarDays} title="Sin turnos hoy" description="Todavía no hay turnos agendados para hoy." />
          )}

          <ul className="space-y-2">
            {data?.upcomingToday.map((appt) => (
              <li
                key={appt.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{appt.client_name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {formatTime(new Date(appt.starts_at))} hs · {appt.service_name}
                  </p>
                </div>
                <Badge tone={statusTone[appt.status as keyof typeof statusTone] ?? 'neutral'}>
                  {appt.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
