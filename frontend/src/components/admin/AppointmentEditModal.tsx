import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { AppointmentStatus, AppointmentWithRelations } from '@/types'
import { toDateInputValue } from '@/utils/format'

interface AppointmentEditModalProps {
  appointment: AppointmentWithRelations | null
  onClose: () => void
  onSave: (input: { startsAt: string; endsAt: string; status: AppointmentStatus }) => void
  onDelete: () => void
  isSaving: boolean
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'no_asistio', label: 'No asistió' },
]

export function AppointmentEditModal({
  appointment,
  onClose,
  onSave,
  onDelete,
  isSaving,
}: AppointmentEditModalProps) {
  if (!appointment) return null
  return <AppointmentEditForm appointment={appointment} onClose={onClose} onSave={onSave} onDelete={onDelete} isSaving={isSaving} />
}

function AppointmentEditForm({
  appointment,
  onClose,
  onSave,
  onDelete,
  isSaving,
}: {
  appointment: AppointmentWithRelations
  onClose: () => void
  onSave: (input: { startsAt: string; endsAt: string; status: AppointmentStatus }) => void
  onDelete: () => void
  isSaving: boolean
}) {
  const start = new Date(appointment.starts_at)
  const durationMs = new Date(appointment.ends_at).getTime() - start.getTime()

  const [date, setDate] = useState(toDateInputValue(start))
  const [time, setTime] = useState(
    `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  )
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    const newStart = new Date(`${date}T${time}:00`)
    const newEnd = new Date(newStart.getTime() + durationMs)
    onSave({ startsAt: newStart.toISOString(), endsAt: newEnd.toISOString(), status })
  }

  return (
    <Modal isOpen onClose={onClose} title="Editar turno">
      <div className="space-y-4">
        <div className="rounded-2xl bg-ink-50 p-4">
          <p className="font-medium text-ink-900">
            {appointment.client.first_name} {appointment.client.last_name}
          </p>
          <p className="text-sm text-ink-500">
            {appointment.service.name} · {appointment.client.phone}
          </p>
          {appointment.notes && (
            <p className="mt-2 text-sm text-ink-600">Observaciones: {appointment.notes}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <Select
          label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={handleSave} isLoading={isSaving}>
            Guardar cambios
          </Button>
          {!confirmDelete ? (
            <Button variant="danger" className="flex-1" onClick={() => setConfirmDelete(true)}>
              Eliminar turno
            </Button>
          ) : (
            <Button variant="danger" className="flex-1" onClick={onDelete} isLoading={isSaving}>
              Confirmar eliminación
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
