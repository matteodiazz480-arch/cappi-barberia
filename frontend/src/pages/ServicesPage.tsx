import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Scissors } from 'lucide-react'
import { getActiveServices } from '@/services/services.service'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Service } from '@/types'

export function ServicesPage() {
  const navigate = useNavigate()
  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: getActiveServices,
  })

  const handleSelect = (service: Service) => {
    navigate('/reservar', { state: { serviceId: service.id } })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-16 lg:max-w-6xl lg:px-8 lg:pt-20 lg:pb-28">
      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-16">
        <div className="space-y-3 lg:sticky lg:top-28 lg:h-fit lg:space-y-5">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 lg:text-5xl">
            Mis servicios
          </h1>
          <p className="text-[15px] leading-relaxed text-ink-500 lg:text-base">
            Cada corte de pelo es mucho más que un servicio: es una experiencia pensada para que
            te sientas cómodo, disfrutes del momento y salgas con un estilo que refleje tu
            personalidad.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-500 lg:text-base">
            Trabajo con dedicación para ofrecer cortes clásicos, modernos y personalizados,
            adaptándome a lo que buscás y asesorándote para encontrar el look que mejor vaya con
            vos.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-500 lg:text-base">
            Mi prioridad es que cada cliente disfrute del tiempo en la barbería, en un ambiente
            relajado, con buena atención y una experiencia de calidad desde que llega hasta que se
            va.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-500 lg:text-base">
            Ya sea que necesites un retoque, un cambio de estilo o simplemente mantener tu corte
            impecable, te invito a reservar tu turno y vivir la experiencia. ¡Te espero en la
            barbería!
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-2 lg:gap-6 xl:grid-cols-2">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <ServiceCardSkeleton key={i} />)}

          {!isLoading && services?.length === 0 && (
            <div className="sm:col-span-2">
              <EmptyState
                icon={Scissors}
                title="Todavía no hay servicios cargados"
                description="Muy pronto vas a poder ver acá todos los servicios disponibles."
              />
            </div>
          )}

          {services?.map((service) => (
            <ServiceCard key={service.id} service={service} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}
