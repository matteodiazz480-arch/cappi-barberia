import { motion } from 'framer-motion'
import { Check, X, Pencil, Clock } from 'lucide-react'
import type { AppointmentStatus, AppointmentWithRelations } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatTime } from '@/utils/format'

const statusTone: Record<AppointmentStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'info'> = {
  pendiente: 'warning',
  confirmado: 'info',
  completado: 'success',
  cancelado: 'danger',
  no_asistio: 'neutral',
}

const statusLabel: Record<AppointmentStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
  no_asistio: 'No asistió',
}

interface AppointmentRowProps {
  appointment: AppointmentWithRelations
  onEdit: () => void
  onQuickConfirm: () => void
  onQuickCancel: () => void
}

export function AppointmentRow({ appointment, onEdit, onQuickConfirm, onQuickCancel }: AppointmentRowProps) {
  const start = new Date(appointment.starts_at)

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-ink-50 py-2 text-ink-700">
          <Clock className="size-3.5" />
          <span className="text-sm font-semibold">{formatTime(start)}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">
            {appointment.client.first_name} {appointment.client.last_name}
          </p>
          <p className="truncate text-sm text-ink-500">
            {appointment.service.name} · {formatPrice(appointment.service.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Badge tone={statusTone[appointment.status]}>{statusLabel[appointment.status]}</Badge>

        {appointment.status === 'pendiente' && (
          <>
            <button
              onClick={onQuickConfirm}
              className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              aria-label="Confirmar turno"
            >
              <Check className="size-5" />
            </button>
            <button
              onClick={onQuickCancel}
              className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition-colors hover:bg-red-100"
              aria-label="Cancelar turno"
            >
              <X className="size-5" />
            </button>
          </>
        )}

        <button
          onClick={onEdit}
          className="flex size-9 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition-colors hover:bg-ink-200"
          aria-label="Editar turno"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    </motion.li>
  )
}
