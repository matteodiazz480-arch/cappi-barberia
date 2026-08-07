import type { AppointmentWithRelations, BlockedSlot, BusinessHours } from '@/types'

export type DaySlotStatus = 'available' | 'booked' | 'blocked' | 'closed'

export interface DaySlot {
  time: string // 'HH:mm'
  status: DaySlotStatus
  appointment?: AppointmentWithRelations
  blockedSlotId?: string
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

interface ComputeDaySlotsParams {
  date: string // 'yyyy-MM-dd'
  businessHours: BusinessHours | undefined
  blockedSlots: BlockedSlot[]
  appointments: AppointmentWithRelations[]
}

/** Genera la grilla de horarios de un día con su estado (disponible,
 * reservado, bloqueado) para la vista de Agenda del admin. */
export function computeDaySlots({
  date,
  businessHours,
  blockedSlots,
  appointments,
}: ComputeDaySlotsParams): DaySlot[] {
  if (!businessHours || !businessHours.is_open || !businessHours.open_time || !businessHours.close_time) {
    return []
  }

  const interval = businessHours.slot_interval_minutes || 30
  const openMin = toMinutes(businessHours.open_time.slice(0, 5))
  const closeMin = toMinutes(businessHours.close_time.slice(0, 5))

  const dayBlocks = blockedSlots
    .filter((b) => new Date(b.starts_at).toISOString().slice(0, 10) <= date && new Date(b.ends_at).toISOString().slice(0, 10) >= date)
    .map((b) => ({
      id: b.id,
      start: new Date(b.starts_at).getTime(),
      end: new Date(b.ends_at).getTime(),
    }))

  const appointmentByTime = new Map<string, AppointmentWithRelations>()
  for (const appt of appointments) {
    if (appt.status === 'cancelado') continue
    const time = new Date(appt.starts_at).toTimeString().slice(0, 5)
    appointmentByTime.set(time, appt)
  }

  const slots: DaySlot[] = []
  for (let start = openMin; start + interval <= closeMin; start += interval) {
    const timeStr = toTimeString(start)
    const slotStart = new Date(`${date}T${timeStr}:00`).getTime()
    const slotEnd = slotStart + interval * 60_000

    const appointment = appointmentByTime.get(timeStr)
    if (appointment) {
      slots.push({ time: timeStr, status: 'booked', appointment })
      continue
    }

    const block = dayBlocks.find((b) => slotStart < b.end && slotEnd > b.start)
    if (block) {
      slots.push({ time: timeStr, status: 'blocked', blockedSlotId: block.id })
      continue
    }

    slots.push({ time: timeStr, status: 'available' })
  }

  return slots
}
