import { supabase } from '@/api/supabase'
import type { AppointmentStatus, AppointmentWithRelations } from '@/types'

export async function getAppointmentsInRange(
  fromIso: string,
  toIso: string
): Promise<AppointmentWithRelations[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, client:clients(*), service:services(*)')
    .gte('starts_at', fromIso)
    .lt('starts_at', toIso)
    .order('starts_at', { ascending: true })

  if (error) throw error
  return data as unknown as AppointmentWithRelations[]
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

export async function rescheduleAppointment(
  id: string,
  startsAtIso: string,
  endsAtIso: string
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ starts_at: startsAtIso, ends_at: endsAtIso })
    .eq('id', id)
  if (error) throw error
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

export function subscribeToNewAppointments(onInsert: () => void) {
  const channel = supabase
    .channel('appointments-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'appointments' },
      () => onInsert()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
