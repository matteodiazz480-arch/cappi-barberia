import { supabase } from '@/api/supabase'
import type { BookingFormData, BusinessHours, TimeSlot } from '@/types'

export async function getBusinessHours(): Promise<BusinessHours[]> {
  const { data, error } = await supabase.from('business_hours').select('*').order('weekday')
  if (error) throw error
  return data as BusinessHours[]
}

interface AvailabilityParams {
  date: string // 'yyyy-MM-dd'
  serviceDurationMinutes: number
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function getAvailableSlots({
  date,
  serviceDurationMinutes,
}: AvailabilityParams): Promise<TimeSlot[]> {
  const weekday = new Date(`${date}T00:00:00`).getDay()

  const [{ data: hoursRow, error: hoursError }, bookedRes, blockedRes] =
    await Promise.all([
      supabase.from('business_hours').select('*').eq('weekday', weekday).maybeSingle(),
      supabase.rpc('get_booked_slots', { p_date: date }),
      supabase.rpc('get_blocked_ranges', { p_date: date }),
    ])

  if (hoursError) throw hoursError
  if (bookedRes.error) throw bookedRes.error
  if (blockedRes.error) throw blockedRes.error

  const booked = bookedRes.data as { start_time: string }[] | null
  const blocked = blockedRes.data as
    | { starts_at: string; ends_at: string; is_full_day: boolean }[]
    | null

  if (!hoursRow || !hoursRow.is_open || !hoursRow.open_time || !hoursRow.close_time) {
    return []
  }

  const isFullyBlocked = (blocked ?? []).some((b) => b.is_full_day)
  if (isFullyBlocked) return []

  const bookedTimes = new Set((booked ?? []).map((b: { start_time: string }) => b.start_time))
  const interval = hoursRow.slot_interval_minutes || 30
  const openMin = toMinutes(hoursRow.open_time.slice(0, 5))
  const closeMin = toMinutes(hoursRow.close_time.slice(0, 5))

  const blockedRanges = (blocked ?? [])
    .filter((b) => !b.is_full_day)
    .map((b) => ({
      start: new Date(b.starts_at as unknown as string).getTime(),
      end: new Date(b.ends_at as unknown as string).getTime(),
    }))

  const now = new Date()
  const isToday = date === now.toISOString().slice(0, 10)
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const slots: TimeSlot[] = []
  for (let start = openMin; start + serviceDurationMinutes <= closeMin; start += interval) {
    const timeStr = toTimeString(start)
    const slotStart = new Date(`${date}T${timeStr}:00`).getTime()
    const slotEnd = slotStart + serviceDurationMinutes * 60_000

    const overlapsBlocked = blockedRanges.some((r) => slotStart < r.end && slotEnd > r.start)
    const isPast = isToday && start <= nowMin
    const isBooked = bookedTimes.has(timeStr)

    slots.push({
      time: timeStr,
      available: !overlapsBlocked && !isPast && !isBooked,
    })
  }

  return slots
}

interface CreateAppointmentResult {
  appointment_id: string
  starts_at: string
  ends_at: string
  service_name: string
}

export async function createAppointment(form: BookingFormData): Promise<CreateAppointmentResult> {
  const startsAtIso = new Date(`${form.date}T${form.time}:00`).toISOString()

  const { data, error } = await supabase.rpc('create_appointment', {
    p_first_name: form.firstName,
    p_last_name: form.lastName,
    p_phone: form.phone,
    p_service_id: form.serviceId,
    p_starts_at: startsAtIso,
    p_notes: form.notes || null,
  })

  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row as CreateAppointmentResult
}
