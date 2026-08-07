import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarX2, Lock, Trash2, CalendarDays, Clock } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { getAppointmentsInRange, updateAppointmentStatus, rescheduleAppointment, deleteAppointment } from '@/services/appointments.service'
import { getBlockedSlots, createBlockedSlot, deleteBlockedSlot } from '@/services/schedule.service'
import { getBusinessHours } from '@/services/booking.service'
import { AppointmentRow } from '@/components/admin/AppointmentRow'
import { AppointmentEditModal } from '@/components/admin/AppointmentEditModal'
import { BlockSlotModal } from '@/components/admin/BlockSlotModal'
import { DaySlotGrid } from '@/components/admin/DaySlotGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/context/ToastContext'
import { formatDateLong, formatDateShort, toDateInputValue } from '@/utils/format'
import { computeDaySlots, type DaySlot } from '@/utils/daySlots'
import type { AppointmentStatus, AppointmentWithRelations } from '@/types'

export function AdminAgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editing, setEditing] = useState<AppointmentWithRelations | null>(null)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
  const dayEnd = addDays(dayStart, 1)
  const dateKey = toDateInputValue(dayStart)

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', dateKey],
    queryFn: () => getAppointmentsInRange(dayStart.toISOString(), dayEnd.toISOString()),
  })

  const { data: blockedSlots } = useQuery({
    queryKey: ['blocked-slots'],
    queryFn: getBlockedSlots,
  })

  const { data: businessHours } = useQuery({
    queryKey: ['business-hours'],
    queryFn: getBusinessHours,
  })

  const invalidateAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const invalidateBlocks = () => queryClient.invalidateQueries({ queryKey: ['blocked-slots'] })

  const handleQuickStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status)
      showToast('Turno actualizado.', 'success')
      invalidateAppointments()
    } catch {
      showToast('No se pudo actualizar el turno.', 'error')
    }
  }

  const handleSaveEdit = async (input: { startsAt: string; endsAt: string; status: AppointmentStatus }) => {
    if (!editing) return
    setIsSaving(true)
    try {
      await rescheduleAppointment(editing.id, input.startsAt, input.endsAt)
      await updateAppointmentStatus(editing.id, input.status)
      showToast('Turno actualizado correctamente.', 'success')
      invalidateAppointments()
      setEditing(null)
    } catch {
      showToast('No se pudo guardar los cambios.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editing) return
    setIsSaving(true)
    try {
      await deleteAppointment(editing.id)
      showToast('Turno eliminado.', 'success')
      invalidateAppointments()
      setEditing(null)
    } catch {
      showToast('No se pudo eliminar el turno.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateBlock = async (input: { startsAt: string; endsAt: string; reason: string; isFullDay: boolean }) => {
    setIsSaving(true)
    try {
      await createBlockedSlot({
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        reason: input.reason || null,
        is_full_day: input.isFullDay,
      })
      showToast('Horario bloqueado.', 'success')
      invalidateBlocks()
      setIsBlockModalOpen(false)
    } catch {
      showToast('No se pudo crear el bloqueo.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteBlockedSlot(id)
      showToast('Bloqueo eliminado.', 'success')
      invalidateBlocks()
    } catch {
      showToast('No se pudo eliminar el bloqueo.', 'error')
    }
  }

  const todaysBusinessHours = businessHours?.find((h) => h.weekday === selectedDate.getDay())

  const daySlots = computeDaySlots({
    date: dateKey,
    businessHours: todaysBusinessHours,
    blockedSlots: blockedSlots ?? [],
    appointments: appointments ?? [],
  })

  const handleQuickBlockSlot = async (time: string) => {
    if (!todaysBusinessHours) return
    if (!confirm(`¿Bloquear el horario de las ${time}?`)) return
    const startsAt = new Date(`${dateKey}T${time}:00`)
    const endsAt = new Date(startsAt.getTime() + (todaysBusinessHours.slot_interval_minutes || 30) * 60_000)
    setIsSaving(true)
    try {
      await createBlockedSlot({
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        reason: null,
        is_full_day: false,
      })
      showToast('Horario bloqueado.', 'success')
      invalidateBlocks()
    } catch {
      showToast('No se pudo bloquear el horario.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnblockSlot = async (slot: DaySlot) => {
    if (!slot.blockedSlotId) return
    if (!confirm(`¿Desbloquear el horario de las ${slot.time}?`)) return
    await handleDeleteBlock(slot.blockedSlotId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Agenda</h1>
          <p className="text-sm text-ink-500">Gestioná los turnos y horarios día a día.</p>
        </div>
        <Button variant="secondary" onClick={() => setIsBlockModalOpen(true)} className="gap-2">
          <Lock className="size-4" />
          Bloquear horario
        </Button>
      </div>

      <Card className="flex items-center justify-between gap-3 p-3">
        <button
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
          className="flex size-10 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
          aria-label="Día anterior"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold capitalize text-ink-900">{formatDateLong(selectedDate)}</span>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-xs text-ink-400 hover:text-ink-700"
          >
            Ir a hoy
          </button>
        </div>

        <button
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          className="flex size-10 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
          aria-label="Día siguiente"
        >
          <ChevronRight className="size-5" />
        </button>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Clock className="size-4" /> Horarios del día
        </h2>
        <DaySlotGrid
          slots={daySlots}
          onSelectAvailable={handleQuickBlockSlot}
          onSelectBooked={(slot) => slot.appointment && setEditing(slot.appointment)}
          onSelectBlocked={handleUnblockSlot}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-800">Turnos reservados</h2>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (appointments?.length ?? 0) === 0 && (
          <EmptyState icon={CalendarX2} title="Sin turnos este día" description="No hay turnos reservados para la fecha seleccionada." />
        )}

        <ul className="space-y-2">
          <AnimatePresence>
            {appointments?.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appointment={appt}
                onEdit={() => setEditing(appt)}
                onQuickConfirm={() => handleQuickStatus(appt.id, 'confirmado')}
                onQuickCancel={() => handleQuickStatus(appt.id, 'cancelado')}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <CalendarDays className="size-4" /> Bloqueos y vacaciones
        </h2>
        {(blockedSlots?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-400">No hay horarios bloqueados.</p>
        ) : (
          <div className="space-y-2">
            {blockedSlots?.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {slot.is_full_day
                      ? `${formatDateShort(new Date(slot.starts_at))} — ${formatDateShort(new Date(slot.ends_at))}`
                      : `${formatDateShort(new Date(slot.starts_at))} · ${new Date(slot.starts_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}–${new Date(slot.ends_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                  {slot.reason && <p className="truncate text-xs text-ink-500">{slot.reason}</p>}
                </div>
                <button
                  onClick={() => handleDeleteBlock(slot.id)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar bloqueo"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AppointmentEditModal
        appointment={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        isSaving={isSaving}
      />

      <BlockSlotModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onCreate={handleCreateBlock}
        isSaving={isSaving}
      />
    </div>
  )
}
