import { supabase } from '@/api/supabase'
import type { BlockedSlot, BusinessHours } from '@/types'

export async function updateBusinessHours(
  id: string,
  input: Partial<BusinessHours>
): Promise<BusinessHours> {
  const { data, error } = await supabase
    .from('business_hours')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as BusinessHours
}

export async function getBlockedSlots(): Promise<BlockedSlot[]> {
  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .order('starts_at', { ascending: true })
  if (error) throw error
  return data as BlockedSlot[]
}

export async function createBlockedSlot(input: Partial<BlockedSlot>): Promise<BlockedSlot> {
  const { data, error } = await supabase.from('blocked_slots').insert(input).select().single()
  if (error) throw error
  return data as BlockedSlot
}

export async function deleteBlockedSlot(id: string): Promise<void> {
  const { error } = await supabase.from('blocked_slots').delete().eq('id', id)
  if (error) throw error
}
