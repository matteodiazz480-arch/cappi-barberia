import { supabase } from '@/api/supabase'
import type { Service } from '@/types'

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Service[]
}

export async function getAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Service[]
}

export async function createService(input: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase.from('services').insert(input).select().single()
  if (error) throw error
  return data as Service
}

export async function updateService(id: string, input: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase.from('services').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Service
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}
