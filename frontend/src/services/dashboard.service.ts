import { supabase } from '@/api/supabase'

export interface DashboardStats {
  todayCount: number
  monthCount: number
  clientsCount: number
  todayRevenue: number
  upcomingToday: Array<{
    id: string
    starts_at: string
    status: string
    client_name: string
    service_name: string
    price: number
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const [todayRes, monthRes, clientsRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, starts_at, status, client:clients(first_name,last_name), service:services(name,price)')
      .gte('starts_at', startOfDay)
      .lt('starts_at', endOfDay)
      .neq('status', 'cancelado')
      .order('starts_at', { ascending: true }),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('starts_at', startOfMonth)
      .lt('starts_at', startOfNextMonth)
      .neq('status', 'cancelado'),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
  ])

  if (todayRes.error) throw todayRes.error
  if (monthRes.error) throw monthRes.error
  if (clientsRes.error) throw clientsRes.error

  type Row = {
    id: string
    starts_at: string
    status: string
    client: { first_name: string; last_name: string } | null
    service: { name: string; price: number } | null
  }

  const todayRows = (todayRes.data ?? []) as unknown as Row[]

  const todayRevenue = todayRows
    .filter((r) => r.status === 'completado')
    .reduce((sum, r) => sum + (r.service?.price ?? 0), 0)

  return {
    todayCount: todayRows.length,
    monthCount: monthRes.count ?? 0,
    clientsCount: clientsRes.count ?? 0,
    todayRevenue,
    upcomingToday: todayRows.map((r) => ({
      id: r.id,
      starts_at: r.starts_at,
      status: r.status,
      client_name: r.client ? `${r.client.first_name} ${r.client.last_name}` : 'Cliente',
      service_name: r.service?.name ?? 'Servicio',
      price: r.service?.price ?? 0,
    })),
  }
}
