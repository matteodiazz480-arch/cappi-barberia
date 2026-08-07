import { supabase } from '@/api/supabase'
import type { BusinessSettings } from '@/types'

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const { data, error } = await supabase.from('business_settings').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateBusinessSettings(
  id: string,
  input: Partial<BusinessSettings>
): Promise<BusinessSettings> {
  const { data, error } = await supabase
    .from('business_settings')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as BusinessSettings
}
