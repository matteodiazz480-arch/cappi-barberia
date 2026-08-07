import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LogOut, CalendarClock, History, User, KeyRound, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useClientAuth } from '@/context/ClientAuthContext'
import { useToast } from '@/context/ToastContext'
import {
  getClientAppointments,
  cancelClientAppointment,
  updateClientProfile,
  changeClientPassword,
} from '@/services/clientAuth.service'
import { formatDateLong, formatPrice } from '@/utils/format'
import {
  clientProfileSchema,
  clientChangePasswordSchema,
  type ClientProfileValues,
  type ClientChangePasswordValues,
} from '@/utils/validation'
import type { AppointmentStatus, ClientAppointment } from '@/types'

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

const CANCELABLE_STATUSES: AppointmentStatus[] = ['pendiente', 'confirmado']

function canCancel(appointment: ClientAppointment): boolean {
  if (!CANCELABLE_STATUSES.includes(appointment.status)) return false
  const hoursUntil = (new Date(appointment.startsAt).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntil > 24
}

function AppointmentCard({ appointment, onCancel }: { appointment: ClientAppointment; onCancel: () => void }) {
  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink-900">{appointment.serviceName}</p>
        <p className="text-sm capitalize text-ink-500">{formatDateLong(new Date(appointment.startsAt))}</p>
        <p className="text-sm font-semibold text-ink-900">{formatPrice(appointment.servicePrice)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Badge tone={statusTone[appointment.status]}>{statusLabel[appointment.status]}</Badge>
        {canCancel(appointment) && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
          >
            <XCircle className="size-3.5" />
            Cancelar
          </button>
        )}
      </div>
    </Card>
  )
}

export function ClientAccountPage() {
  const { profile, token, logout, setProfile } = useClientAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'turnos' | 'historial' | 'perfil'>('turnos')

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['client-appointments', token],
    queryFn: () => getClientAppointments(token!),
    enabled: !!token,
  })

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cancelClientAppointment(token!, appointmentId),
    onSuccess: () => {
      showToast('Turno cancelado.', 'success')
      queryClient.invalidateQueries({ queryKey: ['client-appointments'] })
    },
    onError: (error: Error) => showToast(error.message || 'No se pudo cancelar el turno.', 'error'),
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ClientProfileValues>({
    resolver: zodResolver(clientProfileSchema),
    values: profile ? { firstName: profile.firstName, lastName: profile.lastName } : undefined,
  })

  const profileMutation = useMutation({
    mutationFn: (values: ClientProfileValues) => updateClientProfile(token!, values),
    onSuccess: (updated) => {
      setProfile(updated)
      showToast('Perfil actualizado.', 'success')
    },
    onError: () => showToast('No se pudo actualizar el perfil.', 'error'),
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ClientChangePasswordValues>({ resolver: zodResolver(clientChangePasswordSchema) })

  const passwordMutation = useMutation({
    mutationFn: (values: ClientChangePasswordValues) =>
      changeClientPassword(token!, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      showToast('Contraseña actualizada.', 'success')
      resetPasswordForm()
    },
    onError: (error: Error) => showToast(error.message || 'No se pudo cambiar la contraseña.', 'error'),
  })

  const now = Date.now()
  const upcoming = (appointments ?? []).filter(
    (a) => new Date(a.startsAt).getTime() > now && a.status !== 'cancelado'
  )
  const history = (appointments ?? []).filter(
    (a) => new Date(a.startsAt).getTime() <= now || a.status === 'cancelado'
  )

  if (!profile) return null

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 lg:py-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
              Hola, {profile.firstName}
            </h1>
            <p className="text-sm text-ink-500">{profile.phone}</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => logout()}>
            <LogOut className="size-4" />
            Salir
          </Button>
        </div>

        <div className="mb-6 flex gap-1 rounded-full bg-ink-100 p-1">
          {[
            { key: 'turnos' as const, label: 'Mis turnos', icon: CalendarClock },
            { key: 'historial' as const, label: 'Historial', icon: History },
            { key: 'perfil' as const, label: 'Perfil', icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                tab === key ? 'bg-white text-ink-900 shadow-soft-sm' : 'text-ink-500'
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && tab === 'turnos' && (
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No tenés turnos próximos"
                description="Cuando reserves un turno, lo vas a ver acá."
              />
            ) : (
              upcoming.map((a) => (
                <AppointmentCard key={a.id} appointment={a} onCancel={() => cancelMutation.mutate(a.id)} />
              ))
            )}
          </div>
        )}

        {!isLoading && tab === 'historial' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <EmptyState icon={History} title="Todavía no hay historial" description="Acá vas a ver tus turnos pasados." />
            ) : (
              history.map((a) => (
                <AppointmentCard key={a.id} appointment={a} onCancel={() => cancelMutation.mutate(a.id)} />
              ))
            )}
          </div>
        )}

        {tab === 'perfil' && (
          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
                <User className="size-4" /> Editar perfil
              </h2>
              <form onSubmit={handleProfileSubmit((v) => profileMutation.mutate(v))} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nombre" error={profileErrors.firstName?.message} {...registerProfile('firstName')} />
                  <Input label="Apellido" error={profileErrors.lastName?.message} {...registerProfile('lastName')} />
                </div>
                <Button type="submit" isLoading={profileMutation.isPending}>
                  Guardar cambios
                </Button>
              </form>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
                <KeyRound className="size-4" /> Cambiar contraseña
              </h2>
              <form
                onSubmit={handlePasswordSubmit((v) => passwordMutation.mutate(v))}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="Contraseña actual"
                  type="password"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword')}
                />
                <Input
                  label="Nueva contraseña"
                  type="password"
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword')}
                />
                <Input
                  label="Repetir nueva contraseña"
                  type="password"
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword')}
                />
                <Button type="submit" isLoading={passwordMutation.isPending}>
                  Cambiar contraseña
                </Button>
              </form>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}
