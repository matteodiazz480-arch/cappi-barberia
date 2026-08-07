import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getBusinessHours } from '@/services/booking.service'
import { updateBusinessHours } from '@/services/schedule.service'
import { useToast } from '@/context/ToastContext'
import { Card } from '@/components/ui/Card'

const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function BusinessHoursEditor() {
  const { data: hours } = useQuery({ queryKey: ['business-hours'], queryFn: getBusinessHours })
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const handleChange = async (id: string, patch: Parameters<typeof updateBusinessHours>[1]) => {
    try {
      await updateBusinessHours(id, patch)
      queryClient.invalidateQueries({ queryKey: ['business-hours'] })
    } catch {
      showToast('No se pudo actualizar el horario.', 'error')
    }
  }

  return (
    <Card className="divide-y divide-ink-100 p-2">
      {hours
        ?.slice()
        .sort((a, b) => a.weekday - b.weekday)
        .map((day) => (
          <div key={day.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
            <label className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium text-ink-800">
              <input
                type="checkbox"
                checked={day.is_open}
                onChange={(e) => handleChange(day.id, { is_open: e.target.checked })}
                className="size-4 rounded border-ink-300 text-ink-900 focus:ring-accent-400"
              />
              {dayLabels[day.weekday]}
            </label>

            {day.is_open ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="time"
                  value={day.open_time?.slice(0, 5) ?? '09:00'}
                  onChange={(e) => handleChange(day.id, { open_time: `${e.target.value}:00` })}
                  className="h-9 rounded-lg border border-ink-200 px-2 text-sm"
                />
                <span className="text-ink-400">–</span>
                <input
                  type="time"
                  value={day.close_time?.slice(0, 5) ?? '19:00'}
                  onChange={(e) => handleChange(day.id, { close_time: `${e.target.value}:00` })}
                  className="h-9 rounded-lg border border-ink-200 px-2 text-sm"
                />
              </div>
            ) : (
              <span className="flex-1 text-sm text-ink-400">Cerrado</span>
            )}
          </div>
        ))}
    </Card>
  )
}
