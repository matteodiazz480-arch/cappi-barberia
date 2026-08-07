import { useQuery } from '@tanstack/react-query'
import { Clock, Check, Scissors } from 'lucide-react'
import { getActiveServices } from '@/services/services.service'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { formatDuration, formatPrice } from '@/utils/format'
import type { Service } from '@/types'
import { cn } from '@/utils/cn'

interface ServiceStepProps {
  selectedServiceId: string | null
  onSelect: (service: Service) => void
}

export function ServiceStep({ selectedServiceId, onSelect }: ServiceStepProps) {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: getActiveServices,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="No hay servicios disponibles"
        description="Todavía no se cargaron servicios para reservar."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId
        return (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              'flex gap-3 rounded-3xl border p-3 text-left transition-all',
              isSelected
                ? 'border-ink-900 bg-ink-50 ring-2 ring-ink-900'
                : 'border-ink-100 bg-white hover:border-ink-200'
            )}
          >
            {service.image_url ? (
              <img
                src={service.image_url}
                alt=""
                className="size-20 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <ImagePlaceholder className="size-20 shrink-0 rounded-2xl" />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-ink-900">{service.name}</h3>
                {isSelected && (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
                    <Check className="size-3" />
                  </div>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-ink-400">
                <Clock className="size-3" />
                {formatDuration(service.duration_minutes)}
              </span>
              <span className="text-sm font-semibold text-ink-900">
                {formatPrice(service.price)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
