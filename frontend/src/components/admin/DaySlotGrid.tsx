import { Lock, Unlock, CalendarClock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DaySlot } from '@/utils/daySlots'

interface DaySlotGridProps {
  slots: DaySlot[]
  onSelectAvailable: (time: string) => void
  onSelectBooked: (slot: DaySlot) => void
  onSelectBlocked: (slot: DaySlot) => void
}

const statusStyles: Record<DaySlot['status'], string> = {
  available: 'border-ink-200 bg-white text-ink-700 hover:border-emerald-300 hover:bg-emerald-50',
  booked: 'border-accent-300 bg-accent-50 text-accent-800 hover:bg-accent-100',
  blocked: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  closed: 'border-ink-100 bg-ink-50 text-ink-300',
}

export function DaySlotGrid({ slots, onSelectAvailable, onSelectBooked, onSelectBlocked }: DaySlotGridProps) {
  if (slots.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-400">
        Este día está cerrado según los horarios configurados.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-white ring-1 ring-inset ring-ink-300" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent-400" /> Reservado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" /> Bloqueado
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => {
              if (slot.status === 'available') onSelectAvailable(slot.time)
              else if (slot.status === 'booked') onSelectBooked(slot)
              else if (slot.status === 'blocked') onSelectBlocked(slot)
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors',
              statusStyles[slot.status]
            )}
            title={
              slot.status === 'booked'
                ? `${slot.appointment?.client.first_name} ${slot.appointment?.client.last_name} · ${slot.appointment?.service.name}`
                : slot.status === 'blocked'
                  ? 'Bloqueado — click para desbloquear'
                  : 'Disponible — click para bloquear'
            }
          >
            <span>{slot.time}</span>
            {slot.status === 'booked' && <CalendarClock className="size-3" />}
            {slot.status === 'blocked' && <Lock className="size-3" />}
            {slot.status === 'available' && <Unlock className="size-3 opacity-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}
