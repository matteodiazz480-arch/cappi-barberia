import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Scissors, EyeOff } from 'lucide-react'
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from '@/services/services.service'
import { getServiceIdsWithAppointments } from '@/services/appointments.service'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { ServiceFormModal, type ServiceFormValues } from '@/components/admin/ServiceFormModal'
import { useToast } from '@/context/ToastContext'
import { formatDuration, formatPrice } from '@/utils/format'
import type { Service } from '@/types'

export function AdminServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'all'],
    queryFn: getAllServices,
  })

  const { data: servicesWithAppointments } = useQuery({
    queryKey: ['services', 'with-appointments'],
    queryFn: getServiceIdsWithAppointments,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] })
  }

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) =>
      createService({
        name: values.name,
        description: values.description || null,
        price: values.price,
        duration_minutes: values.duration_minutes,
        image_url: values.image_url || null,
        is_active: values.is_active,
        sort_order: services?.length ?? 0,
      }),
    onSuccess: () => {
      showToast('Servicio creado.', 'success')
      invalidate()
      setIsModalOpen(false)
    },
    onError: () => showToast('No se pudo crear el servicio.', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ServiceFormValues }) =>
      updateService(id, {
        name: values.name,
        description: values.description || null,
        price: values.price,
        duration_minutes: values.duration_minutes,
        image_url: values.image_url || null,
        is_active: values.is_active,
      }),
    onSuccess: () => {
      showToast('Servicio actualizado.', 'success')
      invalidate()
      setEditingService(null)
    },
    onError: () => showToast('No se pudo actualizar el servicio.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      showToast('Servicio eliminado.', 'success')
      invalidate()
    },
    onError: (error: Error) =>
      showToast(error.message || 'No se pudo eliminar el servicio.', 'error'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateService(id, { is_active }),
    onSuccess: invalidate,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Servicios</h1>
          <p className="text-sm text-ink-500">Gestioná el catálogo de servicios de la barbería.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" />
          Nuevo servicio
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {!isLoading && (services?.length ?? 0) === 0 && (
        <EmptyState icon={Scissors} title="No hay servicios" description="Creá el primer servicio para empezar a recibir turnos." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services?.map((service) => {
          const hasAppointments = servicesWithAppointments?.has(service.id) ?? false

          return (
            <Card key={service.id} className="overflow-hidden">
              {service.image_url ? (
                <img src={service.image_url} alt={service.name} className="h-36 w-full object-cover" />
              ) : (
                <ImagePlaceholder className="h-36 w-full" />
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-ink-900">{service.name}</h3>
                  <Badge tone={service.is_active ? 'success' : 'neutral'}>
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="flex items-center justify-between text-sm text-ink-500">
                  <span>{formatDuration(service.duration_minutes)}</span>
                  <span className="font-semibold text-ink-900">{formatPrice(service.price)}</span>
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setEditingService(service)}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      toggleActiveMutation.mutate({ id: service.id, is_active: !service.is_active })
                    }
                  >
                    <EyeOff className="size-3.5" />
                    {service.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={hasAppointments}
                    title={
                      hasAppointments
                        ? 'Tiene turnos asociados: desactivalo en vez de eliminarlo.'
                        : 'Eliminar servicio'
                    }
                    onClick={() => {
                      if (confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)) {
                        deleteMutation.mutate(service.id)
                      }
                    }}
                  >
                    <Trash2 className={hasAppointments ? 'size-3.5 text-ink-300' : 'size-3.5 text-red-600'} />
                  </Button>
                </div>
                {hasAppointments && (
                  <p className="text-xs text-ink-400">
                    Tiene turnos asociados — se puede desactivar pero no eliminar.
                  </p>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {isModalOpen && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isSaving={createMutation.isPending}
        />
      )}

      {editingService && (
        <ServiceFormModal
          key={editingService.id}
          isOpen
          onClose={() => setEditingService(null)}
          service={editingService}
          onSubmit={(values) => updateMutation.mutate({ id: editingService.id, values })}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  )
}
