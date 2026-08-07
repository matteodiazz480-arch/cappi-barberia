import { supabase } from '@/api/supabase'
import type { ClientWithStats } from '@/types'

export async function getClientsWithStats(search?: string): Promise<ClientWithStats[]> {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, phone, notes, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('client_id, starts_at, status')

  if (apptError) throw apptError

  const now = Date.now()

  const withStats: ClientWithStats[] = (clients ?? []).map((client) => {
    const clientAppointments = (appointments ?? []).filter((a) => a.client_id === client.id)
    const past = clientAppointments
      .filter((a) => new Date(a.starts_at as unknown as string).getTime() <= now)
      .sort((a, b) => new Date(b.starts_at as unknown as string).getTime() - new Date(a.starts_at as unknown as string).getTime())
    const future = clientAppointments
      .filter(
        (a) =>
          new Date(a.starts_at as unknown as string).getTime() > now && a.status !== 'cancelado'
      )
      .sort((a, b) => new Date(a.starts_at as unknown as string).getTime() - new Date(b.starts_at as unknown as string).getTime())

    return {
      ...client,
      visits_count: clientAppointments.filter((a) => a.status === 'completado').length,
      last_appointment: past[0]?.starts_at ?? null,
      next_appointment: future[0]?.starts_at ?? null,
    } as ClientWithStats
  })

  if (!search) return withStats

  const term = search.trim().toLowerCase()
  return withStats.filter(
    (c) =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) || c.phone.includes(term)
  )
}
