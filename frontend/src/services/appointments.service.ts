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

/** IDs de servicios que tienen al menos un turno asociado (histórico o
 * vigente). Se usa para saber qué servicios no se pueden borrar sin perder
 * el historial (la FK appointments.service_id lo impide). */
export async function getServiceIdsWithAppointments(): Promise<Set<string>> {
  const { data, error } = await supabase.from('appointments').select('service_id')
  if (error) throw error
  return new Set((data ?? []).map((row) => row.service_id))
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
