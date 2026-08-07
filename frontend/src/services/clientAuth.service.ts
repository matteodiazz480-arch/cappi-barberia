import { supabase } from '@/api/supabase'
import type { ClientAppointment, ClientProfile } from '@/types'

interface AuthRpcRow {
  token: string
  client_id: string
  first_name: string
  last_name: string
  phone: string
}

function toProfile(row: { client_id: string; first_name: string; last_name: string; phone: string }): ClientProfile {
  return { clientId: row.client_id, firstName: row.first_name, lastName: row.last_name, phone: row.phone }
}

export async function registerClient(input: {
  firstName: string
  lastName: string
  phone: string
  password: string
}): Promise<{ token: string; profile: ClientProfile }> {
  const { data, error } = await supabase.rpc('client_register', {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_phone: input.phone,
    p_password: input.password,
  })
  if (error) throw error
  const row = (Array.isArray(data) ? data[0] : data) as AuthRpcRow
  return { token: row.token, profile: toProfile(row) }
}

export async function loginClient(input: {
  phone: string
  password: string
}): Promise<{ token: string; profile: ClientProfile }> {
  const { data, error } = await supabase.rpc('client_login', {
    p_phone: input.phone,
    p_password: input.password,
  })
  if (error) throw error
  const row = (Array.isArray(data) ? data[0] : data) as AuthRpcRow
  return { token: row.token, profile: toProfile(row) }
}

export async function logoutClient(token: string): Promise<void> {
  const { error } = await supabase.rpc('client_logout', { p_token: token })
  if (error) throw error
}

export async function getClientProfile(token: string): Promise<ClientProfile | null> {
  const { data, error } = await supabase.rpc('client_get_profile', { p_token: token })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row ? toProfile(row) : null
}

export async function getClientAppointments(token: string): Promise<ClientAppointment[]> {
  const { data, error } = await supabase.rpc('client_get_appointments', { p_token: token })
  if (error) throw error
  return ((data ?? []) as Array<{
    id: string
    service_name: string
    service_price: number
    starts_at: string
    ends_at: string
    status: ClientAppointment['status']
    notes: string | null
  }>).map((row) => ({
    id: row.id,
    serviceName: row.service_name,
    servicePrice: row.service_price,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes,
  }))
}

export async function cancelClientAppointment(token: string, appointmentId: string): Promise<void> {
  const { error } = await supabase.rpc('client_cancel_appointment', {
    p_token: token,
    p_appointment_id: appointmentId,
  })
  if (error) throw error
}

export async function updateClientProfile(
  token: string,
  input: { firstName: string; lastName: string }
): Promise<ClientProfile> {
  const { data, error } = await supabase.rpc('client_update_profile', {
    p_token: token,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return toProfile(row)
}

export async function changeClientPassword(
  token: string,
  input: { currentPassword: string; newPassword: string }
): Promise<void> {
  const { error } = await supabase.rpc('client_change_password', {
    p_token: token,
    p_current_password: input.currentPassword,
    p_new_password: input.newPassword,
  })
  if (error) throw error
}
