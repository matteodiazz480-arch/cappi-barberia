import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDays } from 'date-fns'
import { CalendarX } from 'lucide-react'
import { getAvailableSlots } from '@/services/booking.service'
import { toDateInputValue } from '@/utils/format'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'

interface DateTimeStepProps {
  serviceDurationMinutes: number
  selectedDate: string
  selectedTime: string | null
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
}

const dayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const dayNumberFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric' })
const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'short' })

export function DateTimeStep({
  serviceDurationMinutes,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: DateTimeStepProps) {
  const days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 21 }, (_, i) => addDays(today, i))
  }, [])

  const { data: slots, isLoading } = useQuery({
    queryKey: ['available-slots', selectedDate, serviceDurationMinutes],
    queryFn: () => getAvailableSlots({ date: selectedDate, serviceDurationMinutes }),
    enabled: !!selectedDate,
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-ink-700">Elegí un día</h3>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {days.map((day) => {
            const value = toDateInputValue(day)
            const isSelected = value === selectedDate
            return (
              <button
                key={value}
                onClick={() => onSelectDate(value)}
                className={cn(
                  'flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-2xl border py-2.5 transition-colors',
                  isSelected
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-100 bg-white text-ink-700 hover:border-ink-200'
                )}
              >
                <span className="text-[11px] uppercase opacity-70">{dayFormatter.format(day)}</span>
                <span className="text-base font-semibold">{dayNumberFormatter.format(day)}</span>
                <span className="text-[10px] opacity-70">{monthFormatter.format(day)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-ink-700">Horarios disponibles</h3>

        {isLoading && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        )}

        {!isLoading && slots && slots.filter((s) => s.available).length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="No hay horarios disponibles"
            description="Probá eligiendo otro día."
          />
        )}

        {!isLoading && slots && slots.some((s) => s.available) && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {slots
              .filter((s) => s.available)
              .map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => onSelectTime(slot.time)}
                  className={cn(
                    'h-11 rounded-xl border text-sm font-medium transition-colors',
                    slot.time === selectedTime
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-100 bg-white text-ink-700 hover:border-ink-300'
                  )}
                >
                  {slot.time}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
