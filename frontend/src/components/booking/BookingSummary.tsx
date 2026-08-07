import { CalendarClock, Scissors, Clock } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { formatDateLong, formatDuration, formatPrice } from '@/utils/format'
import type { Service } from '@/types'

interface BookingSummaryProps {
  service: Service | null
  date: string
  time: string | null
}

export function BookingSummary({ service, date, time }: BookingSummaryProps) {
  return (
    <aside className="sticky top-28 hidden h-fit w-80 shrink-0 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft-sm lg:block">
      <h2 className="text-sm font-semibold text-ink-800">Resumen de tu turno</h2>

      {!service ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-400">
          A medida que vayas eligiendo el servicio, la fecha y el horario, acá vas a ver el
          resumen de tu reserva.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex gap-3">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt=""
                className="size-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <ImagePlaceholder className="size-16 shrink-0 rounded-2xl" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{service.name}</p>
              <p className="flex items-center gap-1 text-xs text-ink-400">
                <Clock className="size-3" />
                {formatDuration(service.duration_minutes)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink-900">
                {formatPrice(service.price)}
              </p>
            </div>
          </div>

          {time && (
            <div className="flex items-start gap-3 border-t border-ink-100 pt-5">
              <CalendarClock className="size-4 shrink-0 text-ink-400" />
              <p className="text-sm capitalize leading-relaxed text-ink-700">
                {formatDateLong(new Date(`${date}T00:00:00`))}
                <br />
                {time} hs
              </p>
            </div>
          )}

          {!time && (
            <div className="flex items-center gap-3 border-t border-ink-100 pt-5 text-sm text-ink-400">
              <Scissors className="size-4" />
              Elegí una fecha y horario para continuar.
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
