import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Phone, CalendarClock, History } from 'lucide-react'
import { getClientsWithStats } from '@/services/clients.service'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateShort } from '@/utils/format'

export function AdminClientsPage() {
  const [search, setSearch] = useState('')

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => getClientsWithStats(search),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Clientes</h1>
        <p className="text-sm text-ink-500">Buscá y consultá el historial de tus clientes.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <Input
          placeholder="Buscar por nombre o teléfono…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && (clients?.length ?? 0) === 0 && (
        <EmptyState icon={Users} title="No se encontraron clientes" description="Probá con otro nombre o teléfono." />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {clients?.map((client) => (
          <Card key={client.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">
                  {client.first_name} {client.last_name}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-ink-500">
                  <Phone className="size-3.5" /> {client.phone}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
                {client.visits_count} visitas
              </span>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
              <p className="flex items-center gap-1.5 text-ink-500">
                <History className="size-3.5 shrink-0" />
                Último turno:{' '}
                {client.last_appointment ? formatDateShort(new Date(client.last_appointment)) : '—'}
              </p>
              <p className="flex items-center gap-1.5 text-ink-500">
                <CalendarClock className="size-3.5 shrink-0" />
                Próximo turno:{' '}
                {client.next_appointment ? formatDateShort(new Date(client.next_appointment)) : '—'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
